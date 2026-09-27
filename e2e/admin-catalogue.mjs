import path from "node:path";
import { pathToFileURL } from "node:url";
const modulePath = process.env.PLAYWRIGHT_MODULE_PATH;
const { chromium } = await import(modulePath ? pathToFileURL(path.join(modulePath, "index.mjs")).href : "playwright");
const base = process.env.CIVICFLOW_BASE_URL || "http://127.0.0.1:3000";
const ids = ["home-food-business", "birth-certificate", "small-business", "driving-licence-renewal", "property-registration", "society-registration"];
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_BROWSER_CHANNEL || "chrome", headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 375, height: 900 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  async function hydrated() { await page.waitForFunction(() => Object.keys(document.querySelector("button") || {}).some((key) => key.startsWith("__reactProps$"))); await page.waitForTimeout(200); }
  const saved = () => page.evaluate(() => JSON.parse(localStorage.getItem("civicflow.local-demo.v1")));
  await page.goto(base + "/app/goals/home-food-business/roadmap"); await hydrated();
  await page.getByRole("button", { name: "Determine FSSAI route", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Mark step complete", exact: true }).click();
  await page.keyboard.press("Escape");
  const original = JSON.stringify((await saved()).workflow);
  await page.goto(base + "/admin"); await hydrated();
  await page.getByRole("button", { name: "Sources", exact: true }).click();
  if (await page.getByRole("link", { name: "Open official portal", exact: true }).count() !== 8) throw new Error("Admin sources still cover only the food procedure");
  await page.getByRole("button", { name: "Claims", exact: true }).click();
  for (const id of ids) {
    await page.getByRole("combobox", { name: "Review procedure" }).selectOption(id);
    if (await page.locator('[aria-label="Claims demo workspace"] article').count() < 6) throw new Error(`Missing claims: ${id}`);
  }
  await page.getByRole("button", { name: "Procedures", exact: true }).click();
  if (await page.getByRole("link", { name: "Open procedure graph", exact: true }).count() !== 6) throw new Error("Admin procedures are stale");
  if (await page.getByRole("link", { name: "Compare scenarios", exact: true }).count() !== 6) throw new Error("Scenario tools missing from admin");
  await page.getByRole("button", { name: "Evaluations", exact: true }).click();
  await page.getByRole("button", { name: "Run graph checks", exact: true }).click();
  await page.getByText("34 scenario variants checked · Pass", { exact: true }).waitFor();
  if (JSON.stringify((await saved()).workflow) !== original) throw new Error("Admin diagnostics changed roadmap progress");
  await page.getByRole("button", { name: /^Changes/ }).click();
  await page.getByRole("button", { name: "Approve demo change" }).click();
  if (JSON.stringify((await saved()).workflow) !== original) throw new Error("Admin approval discarded roadmap progress");
  await page.getByRole("button", { name: "Audit log", exact: true }).click();
  await page.getByText("Synthetic change approved", { exact: true }).waitFor();
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const tab of ["Overview", "Sources", "Claims", "Procedures", "Evaluations", "Audit log", "Changes"]) {
      await page.getByRole("button", { name: tab, exact: tab !== "Changes" }).click();
      const contentWidth = await page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth));
      if (contentWidth > width + 1) throw new Error(`Admin ${tab} overflows at ${width}`);
    }
    console.log(`PASS all admin sections at ${width}px`);
  }
  if (errors.length) throw new Error(errors.join("\n"));
  console.log("PASS six procedures, eight references, claims selection, actual 34-variant diagnostics and review preservation");
} finally { await browser.close(); }
