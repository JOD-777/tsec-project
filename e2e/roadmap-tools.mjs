import path from "node:path";
import os from "node:os";
import fs from "node:fs";
import { pathToFileURL } from "node:url";
const modulePath = process.env.PLAYWRIGHT_MODULE_PATH;
const { chromium } = await import(modulePath ? pathToFileURL(path.join(modulePath, "index.mjs")).href : "playwright");
const base = process.env.CIVICFLOW_BASE_URL || "http://127.0.0.1:3000";
const artifacts = process.env.CIVICFLOW_ARTIFACTS || path.join(os.tmpdir(), "civicflow-tools");
fs.mkdirSync(artifacts, { recursive: true });
const ids = ["home-food-business", "birth-certificate", "small-business", "driving-licence-renewal", "property-registration", "society-registration"];
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_BROWSER_CHANNEL || "chrome", headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  async function hydrated() {
    await page.waitForFunction(() => Object.keys(document.querySelector("button") || {}).some((key) => key.startsWith("__reactProps$")));
    await page.waitForTimeout(200);
  }
  async function rawState() { return page.evaluate(() => localStorage.getItem("civicflow.local-demo.v1")); }
  async function state() { return JSON.parse(await rawState()); }
  await page.goto(base + "/app/goals/home-food-business/roadmap"); await hydrated();
  if ((await page.getByRole("button", { name: "Overview", exact: true }).getAttribute("aria-expanded")) !== "true" || !await page.locator(".roadmap-details").isVisible()) throw new Error("Default panels are not open");
  await page.getByRole("button", { name: "Overview", exact: true }).click();
  await page.getByRole("button", { name: "Step details", exact: true }).click();
  const full = await page.locator(".roadmap-canvas").boundingBox();
  const graph = await page.locator(".roadmap-graph").boundingBox();
  if (full.width < 1440 * 0.95 || graph.height < 900 * 0.6) throw new Error(`Canvas does not use available space: ${JSON.stringify({ full, graph })}`);
  await page.getByRole("button", { name: "Overview", exact: true }).click();
  const overviewWidth = (await page.locator(".roadmap-canvas").boundingBox()).width;
  if (full.width - overviewWidth < 200) throw new Error("Overview does not collapse independently");
  await page.locator('.react-flow__node[data-id="fssai"]').click();
  await page.getByRole("button", { name: "Mark step complete", exact: true }).click();
  await page.getByRole("textbox", { name: /Notes/ }).fill("Retain sample note");
  await page.getByRole("button", { name: "Step details", exact: true }).click();
  await page.getByRole("button", { name: "Overview", exact: true }).click();
  const collapsed = await page.locator(".roadmap-canvas").boundingBox();
  if (Math.abs(collapsed.width - full.width) > 2) throw new Error("Collapsed panels did not release canvas width");
  await page.screenshot({ path: path.join(artifacts, "roadmap-wide.png"), fullPage: true, animations: "disabled", caret: "initial" });
  // Model an already-used roadmap before checking scenario preservation.
  await page.evaluate(() => {
    const key = "civicflow.local-demo.v1", saved = JSON.parse(localStorage.getItem(key));
    saved.workflow.completed = ["scope", "premises", "fssai", "docs", "gst", "apply", "ready"];
    saved.workflow.documents = ["Premises proof"];
    localStorage.setItem(key, JSON.stringify(saved));
    window.dispatchEvent(new StorageEvent("storage", { key }));
  });
  await page.getByRole("link", { name: "What-if", exact: true }).click(); await hydrated();
  const original = await rawState();
  if (await page.getByRole("button", { name: "Apply scenario to my roadmap" }).isEnabled()) throw new Error("Unchanged scenario should not apply");
  await page.getByRole("combobox", { name: "Premises", exact: true }).selectOption("commercial");
  await page.getByText("Preview only — saved progress is unchanged.", { exact: true }).waitFor();
  if (await rawState() !== original) throw new Error("What-if preview changed saved progress");
  await page.getByRole("link", { name: "Discard preview" }).click(); await hydrated();
  if (await rawState() !== original) throw new Error("Discarded preview changed saved progress");
  await page.getByRole("link", { name: "What-if", exact: true }).click(); await hydrated();
  await page.getByRole("combobox", { name: "Premises", exact: true }).selectOption("commercial");
  await page.getByRole("button", { name: "Apply scenario to my roadmap" }).click();
  await page.waitForURL("**/home-food-business/roadmap"); await hydrated();
  const applied = (await state()).workflow;
  if (JSON.stringify(applied.completed) !== JSON.stringify(["scope", "fssai", "gst"])) throw new Error("Scenario did not reopen only affected steps");
  if (applied.notes.fssai !== "Retain sample note" || !applied.documents.includes("Premises proof")) throw new Error("Scenario discarded notes or readiness");
  const foodState = JSON.stringify(applied);
  for (const id of ids.slice(1)) {
    await page.goto(base + `/app/goals/${id}/what-if`); await hydrated();
    const before = await rawState();
    const selects = await page.locator("main select").all();
    for (const select of selects) await select.selectOption(await select.locator("option").last().getAttribute("value"));
    if (await rawState() !== before) throw new Error(`Preview writes storage: ${id}`);
    await page.getByRole("button", { name: "Apply scenario to my roadmap" }).click();
    await page.waitForURL(`**/${id}/roadmap`); await hydrated();
    const saved = await state();
    if (saved.workflows[id]?.procedureId !== id || JSON.stringify(saved.workflow) !== foodState) throw new Error(`Scenario isolation failed: ${id}`);
    console.log(`PASS preview and explicit apply: ${id}`);
  }
  await page.goto(base + "/app/goals/home-food-business/documents"); await hydrated();
  const address = page.getByRole("checkbox", { name: /^Address proof/ });
  await address.check(); await page.reload(); await hydrated();
  if (!await address.isChecked()) throw new Error("Readiness did not persist");
  if (JSON.stringify((await state()).workflow.completed) !== JSON.stringify(applied.completed)) throw new Error("Readiness changed task completion");
  await page.getByText("Show related steps and sources", { exact: true }).first().click();
  if (!await page.getByRole("link", { name: "MyBMC services", exact: true }).count()) throw new Error("Readiness is missing source links");
  await page.getByRole("link", { name: "Print / Save as PDF", exact: true }).click(); await page.waitForURL("**/home-food-business/print"); await page.locator(".print-report ol li").first().waitFor(); await hydrated();
  if (await page.locator(".print-report ol li").count() !== 8) throw new Error("Export missed procedure steps");
  if (await page.getByText("Retain sample note", { exact: false }).count()) throw new Error("Notes included without consent");
  await page.evaluate(() => { window.print = () => { window.__civicflowPrinted = true; }; });
  await page.getByRole("button", { name: "Print / Save as PDF", exact: true }).click();
  if (!await page.evaluate(() => window.__civicflowPrinted)) throw new Error("Print control did not invoke the browser print dialog");
  await page.emulateMedia({ media: "print" });
  if (await page.locator(".print-controls").first().isVisible() || await page.getByRole("button", { name: "Open CivicFlow Copilot" }).isVisible()) throw new Error("Print output includes app controls");
  const pdf = await page.pdf({ path: path.join(artifacts, "roadmap-report.pdf"), format: "A4", printBackground: true, preferCSSPageSize: true });
  if (pdf.subarray(0, 4).toString() !== "%PDF" || pdf.length < 10_000) throw new Error("A readable PDF was not generated");
  await page.emulateMedia({ media: "screen" });
  await page.getByRole("checkbox", { name: "Include my local notes" }).check();
  await page.getByText("Retain sample note", { exact: false }).waitFor();
  await page.pdf({ path: path.join(artifacts, "roadmap-report-with-notes.pdf"), format: "A4", preferCSSPageSize: true });
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const id of ids) for (const tool of ["roadmap", "what-if", "documents", "print"]) {
      const route = `/app/goals/${id}/${tool}`, response = await page.goto(base + route); await hydrated();
      if (response.status() !== 200) throw new Error(`${route}: ${response.status()}`);
      const contentWidth = await page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth));
      if (contentWidth > width + 1) throw new Error(`${route} overflows at ${width}: ${contentWidth}`);
    }
    console.log(`PASS roadmap and all tools at ${width}px`);
  }
  await page.getByRole("button", { name: "Toggle colour theme" }).click();
  for (const id of ids) { await page.goto(base + `/app/goals/${id}/roadmap`); await hydrated(); }
  if (errors.length) throw new Error(errors.join("\n"));
  console.log(`PASS full canvas, collapsible panels, six scenarios, preservation, readiness and PDF export (${artifacts})`);
} finally { await browser.close(); }
