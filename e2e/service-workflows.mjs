import path from "node:path";
import { pathToFileURL } from "node:url";
const modulePath = process.env.PLAYWRIGHT_MODULE_PATH;
const { chromium } = await import(modulePath ? pathToFileURL(path.join(modulePath, "index.mjs")).href : "playwright");
const base = process.env.CIVICFLOW_BASE_URL || "http://127.0.0.1:3000";
const ids = ["home-food-business", "birth-certificate", "small-business", "driving-licence-renewal", "property-registration", "society-registration"];
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_BROWSER_CHANNEL || "chrome", headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  // Demo intake must work when the optional intent service is unavailable.
  await page.route("**/api/intent", (route) => route.fulfill({ status: 503, body: "unavailable" }));
  async function hydrated() {
    await page.waitForFunction(() => Object.keys(document.querySelector("button") || {}).some((key) => key.startsWith("__reactProps$")));
    await page.waitForTimeout(150);
  }
  async function noOverflow(route, width) {
    const response = await page.goto(base + route);
    await hydrated();
    if (response.status() !== 200) throw new Error(`${route}: HTTP ${response.status()}`);
    const size = await page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth));
    if (size > width + 1) throw new Error(`${route} overflows at ${width}: ${size}`);
    if (route.startsWith("/services/")) {
      await page.getByRole("heading", { name: "Procedure overview", exact: true }).waitFor();
      await page.getByRole("heading", { name: "What you’ll prepare", exact: true }).waitFor();
      await page.getByRole("heading", { name: "Eligibility and fees", exact: true }).waitFor();
      await page.getByRole("heading", { name: "Official sources and agencies", exact: true }).waitFor();
      if (await page.locator("main ol li").count() < 6) throw new Error(`Missing procedure steps: ${route}`);
    }
  }
  await page.goto(base + "/services");
  await hydrated();
  await page.getByRole("link", { name: "View procedure details" }).first().click();
  await page.getByRole("heading", { name: "Procedure overview", exact: true }).waitFor();
  if (!page.url().endsWith("/services/home-food-business")) throw new Error("Service details button opens the wrong page");
  await page.goto(base + "/demo");
  await hydrated();
  if (await page.getByRole("link", { name: "Build sample roadmap" }).count() !== 6) throw new Error("Demo chooser must show all six services");
  for (const id of ids) {
    await page.goto(base + `/demo?goal=${id}`);
    await hydrated();
    await page.waitForFunction(() => [...document.querySelectorAll("select")].every((select) => Object.keys(select).some((key) => key.startsWith("__reactProps$"))));
    if (id !== "home-food-business") {
      for (const select of await page.locator("main select").all()) {
        const last = await select.locator("option").last().getAttribute("value");
        await select.selectOption(last);
      }
    }
    const compile = page.getByRole("button", { name: "Compile my roadmap" });
    if (await compile.isEnabled()) throw new Error("Jurisdiction must be confirmed before compiling");
    await page.getByRole("checkbox", { name: /^Use the/ }).check();
    await compile.click();
    await page.getByRole("link", { name: "Open interactive roadmap" }).click();
    await hydrated();
    if (!page.url().endsWith(`/app/goals/${id}/roadmap`)) throw new Error(`Wrong roadmap for ${id}`);
    const before = await page.getByRole("progressbar").getAttribute("aria-valuenow");
    await page.getByRole("button", { name: "Open step", exact: true }).click();
    await page.getByRole("dialog").waitFor({ state: "visible" });
    await page.getByRole("dialog").getByRole("textbox", { name: /Notes/ }).fill("Sample local note");
    await page.getByRole("dialog").getByRole("button", { name: "Mark step complete", exact: true }).click();
    await page.keyboard.press("Escape");
    await page.reload();
    await hydrated();
    const after = await page.getByRole("progressbar").getAttribute("aria-valuenow");
    if (Number(after) <= Number(before)) throw new Error(`Progress did not persist for ${id}`);
    await page.getByRole("button", { name: "Open CivicFlow Copilot" }).click();
    await page.getByRole("textbox", { name: "Ask CivicFlow", exact: true }).fill("What should I do next?");
    await page.getByRole("button", { name: "Send question" }).click();
    await page.getByText(/Current sample progress:/).last().waitFor();
    await page.getByRole("button", { name: "Close CivicFlow Copilot" }).click();
    console.log(`PASS intake, completion, notes, reload and assistant: ${id}`);
  }
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("civicflow.local-demo.v1")));
  if (Object.keys(stored.workflows).length !== 5 || stored.workflow.completed.length !== 2) throw new Error("Service progress was overwritten");
  for (const [id, workflow] of Object.entries(stored.workflows)) {
    if (workflow.procedureId !== id || Object.keys(workflow.notes).length !== 1) throw new Error(`Incorrect service persistence: ${id}`);
  }
  await page.goto(base + "/app");
  await hydrated();
  if (await page.getByRole("link", { name: /Open roadmap/ }).count() !== 6) throw new Error("Dashboard must list all saved roadmaps");
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const id of ids) for (const route of [`/services/${id}`, `/demo?goal=${id}`, `/app/goals/${id}/roadmap`]) await noOverflow(route, width);
    for (const route of ["/services", "/demo", "/app"]) await noOverflow(route, width);
    console.log(`PASS all service pages at ${width}px`);
  }
  await page.getByRole("button", { name: "Toggle colour theme" }).click();
  for (const id of ids) {
    await noOverflow(`/app/goals/${id}/roadmap`, 1440);
    const nodes = await page.locator(".react-flow__node").count();
    const edges = await page.locator(".react-flow__edge").count();
    if (nodes < 6 || edges < 6) throw new Error(`Incomplete dependency graph: ${id} (${nodes}, ${edges})`);
  }
  // A deliberate 503 creates a browser console network error; other errors are failures.
  const unexpected = errors.filter((message) => !message.includes("503"));
  if (unexpected.length) throw new Error(unexpected.join("\n"));
  console.log("PASS six independent workflows, offline intake, dashboard, dependency graphs, dark theme and responsive layouts");
} finally { await browser.close(); }
