import path from "node:path";
import fs from "node:fs";
import { pathToFileURL } from "node:url";
const modulePath = process.env.PLAYWRIGHT_MODULE_PATH;
const { chromium } = await import(modulePath ? pathToFileURL(path.join(modulePath, "index.mjs")).href : "playwright");
const base = process.env.CIVICFLOW_BASE_URL || "http://127.0.0.1:3000";
const ids = ["home-food-business", "birth-certificate", "small-business", "driving-licence-renewal", "property-registration", "society-registration"];
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_BROWSER_CHANNEL || "chrome", headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  async function visit(route) {
    const response = await page.goto(base + route);
    if (response.status() !== 200) throw new Error(`${route}: ${response.status()}`);
    await page.waitForFunction(() => Object.keys(document.querySelector("header button") || {}).some((key) => key.startsWith("__reactProps$")));
    await page.waitForTimeout(100);
  }
  async function search(query) {
    await page.keyboard.press("Control+k");
    await page.locator(".command-dialog input").fill(query);
    await page.locator(".command-dialog input").press("Enter");
  }
  async function stored() { return page.evaluate(() => JSON.parse(localStorage.getItem("civicflow.local-demo.v1"))); }
  await visit("/");
  await page.getByRole("button", { name: "Search CivicFlow", exact: true }).click();
  await page.locator(".command-dialog input").fill("nonsense");
  await page.getByText("No matching services or commands. Try a service name or “theme”.").waitFor();
  await page.keyboard.press("Escape");
  if (!await page.getByRole("button", { name: "Search CivicFlow", exact: true }).evaluate((element) => element === document.activeElement)) throw new Error("Search did not restore focus");
  await search("birth print");
  await page.waitForURL("**/app/goals/birth-certificate/print");
  await search("system theme");
  if (await page.evaluate(() => localStorage.getItem("theme")) !== "system") throw new Error("System theme command failed");
  await visit("/app/goals/home-food-business/roadmap");
  await page.getByRole("combobox", { name: "Filter step status" }).selectOption("ready");
  if (await page.locator(".react-flow__node").count() !== 2) throw new Error("Ready filter did not select two unlocked actions");
  await page.getByRole("combobox", { name: "Filter step status" }).selectOption("blocked");
  if (await page.locator(".react-flow__node").count() !== 4) throw new Error("Blocked filter does not match dependencies");
  await page.getByRole("searchbox", { name: "Search roadmap steps" }).fill("unmatched");
  await page.getByText("No matching steps. Try another search or clear the filters.").waitFor();
  await page.getByRole("button", { name: "Clear filters" }).click();
  if (await page.locator(".react-flow__node").count() !== 8) throw new Error("Clear filters did not restore graph");
  await page.getByRole("button", { name: "Mark step complete", exact: true }).click();
  await page.getByRole("textbox", { name: /Notes/ }).fill("Keep this local sample note");
  const saved = await stored();
  await visit("/demo?goal=home-food-business");
  await page.getByRole("link", { name: "Resume saved roadmap" }).waitFor();
  await page.getByRole("checkbox", { name: /Use the Mumbai/ }).check();
  await page.getByRole("button", { name: "Compile my roadmap" }).click();
  await page.getByRole("dialog", { name: "Replace this saved sample?" }).waitFor();
  await page.getByRole("button", { name: "Keep saved roadmap" }).click();
  if (JSON.stringify(await stored()) !== JSON.stringify(saved)) throw new Error("Cancelling replacement changed saved work");
  await page.getByRole("link", { name: "Resume saved roadmap" }).click();
  await page.getByRole("button", { name: "Open CivicFlow Copilot" }).click();
  await page.getByRole("button", { name: "What should I do next?" }).click();
  await page.getByText(/Live AI ·|Verified guidance fallback ·/).last().waitFor();
  const foodReply = await page.locator('[role="log"] .is-assistant').last().innerText();
  if (!/food|premises|FoSCoS|FSSAI/i.test(foodReply)) throw new Error(`Home-food assistant lost roadmap context: ${foodReply}`);
  await search("birth roadmap");
  await page.waitForURL("**/app/goals/birth-certificate/roadmap");
  await page.getByRole("button", { name: "Open CivicFlow Copilot" }).click();
  if (await page.locator('[role="log"] .is-user').count()) throw new Error("Previous service conversation leaked");
  await page.getByRole("button", { name: "What should I do next?" }).click();
  await page.getByText(/Live AI ·|Verified guidance fallback ·/).last().waitFor();
  const birthReply = await page.locator('[role="log"] .is-assistant').last().innerText();
  if (!/birth|registered record|BMC/i.test(birthReply)) throw new Error(`Birth assistant lost roadmap context: ${birthReply}`);
  await page.getByRole("button", { name: "Close CivicFlow Copilot" }).click();
  console.log("PASS keyboard search, themes, dependency filters, safe intake replacement and isolated assistant context");
  const englishPhrases = [];
  for (const file of ["translations", "sample-translations", "translation-extras"]) {
    const rows = fs.readFileSync(new URL(`../src/lib/${file}.ts`, import.meta.url), "utf8").match(/`\n([\s\S]*?)\n`/)[1];
    for (const row of rows.split("\n")) { const [en, hi, mr] = row.split("|"); if (en !== hi && en !== mr) englishPhrases.push(en); }
  }
  const routes = ["/", "/services", "/demo", "/app", "/admin", "/how-it-works", "/about", "/privacy", "/disclaimer", ...ids.flatMap((id) => [`/services/${id}`, `/demo?goal=${id}`, ...["roadmap", "what-if", "documents", "print"].map((tool) => `/app/goals/${id}/${tool}`)])];
  const originalWorkflow = JSON.stringify((await stored()).workflow);
  for (const locale of ["hi", "mr"]) {
    await visit("/app/goals/home-food-business/roadmap");
    await page.locator(".roadmap-header select:visible").selectOption(locale);
    await page.waitForFunction((value) => document.documentElement.lang === value, locale);
    for (const width of [320, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of routes) {
        await visit(route);
        const result = await page.evaluate((phrases) => {
          const untranslated = new Set(), walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          while (walker.nextNode()) {
            const node = walker.currentNode, parent = node.parentElement;
            if (!parent || parent.closest("script,style") || !parent.checkVisibility()) continue;
            const text = node.textContent.trim().replace(/\s+/g, " ");
            if (phrases.includes(text)) untranslated.add(text);
          }
          return { width: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth), untranslated: [...untranslated] };
        }, englishPhrases);
        if (result.width > width + 1) throw new Error(`${locale} ${route} overflow at ${width}: ${result.width}`);
        if (result.untranslated.length) throw new Error(`${locale} ${route} untranslated UI: ${result.untranslated.join("; ")}`);
      }
      console.log(`PASS ${locale}: translated public, intake, service and roadmap tools at ${width}px`);
    }
    if (JSON.stringify((await stored()).workflow) !== originalWorkflow) throw new Error("Language switching changed saved progress or notes");
    await visit("/app/goals/birth-certificate/roadmap");
    await page.getByRole("button", { name: locale === "hi" ? "CivicFlow सहायक खोलें" : "CivicFlow सहाय्यक उघडा" }).click();
    await page.getByRole("button", { name: locale === "hi" ? "मुझे आगे क्या करना चाहिए?" : "मी पुढे काय करावे?" }).click();
    await page.waitForFunction(() => document.querySelectorAll('[role="log"] .is-assistant').length > 1, undefined, { timeout: 35_000 });
    const localizedReply = await page.locator('[role="log"] .is-assistant').last().innerText();
    if (!/जन्म|नोंद|अभिलेख|रेकॉर्ड|BMC/i.test(localizedReply)) throw new Error(`${locale} assistant lost localized roadmap context: ${localizedReply}`);
    await page.keyboard.press("Escape");
    await page.keyboard.press("Control+k");
    await page.locator(".command-dialog input").fill("जन्म");
    if (await page.locator('.command-dialog [role="option"]').count() !== 5) throw new Error("Translated service search failed");
    await page.keyboard.press("Escape");
  }
  if (errors.length) throw new Error(errors.join("\n"));
  console.log("PASS multilingual rendering, localized assistant/search and unchanged stored workflow");
} finally { await browser.close(); }
