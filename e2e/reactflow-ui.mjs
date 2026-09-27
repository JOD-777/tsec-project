import path from "node:path";
import { pathToFileURL } from "node:url";
const modulePath = process.env.PLAYWRIGHT_MODULE_PATH;
const { chromium } = await import(modulePath ? pathToFileURL(path.join(modulePath, "index.mjs")).href : "playwright");
const base = process.env.CIVICFLOW_BASE_URL || "http://127.0.0.1:3000";
const ids = ["home-food-business", "birth-certificate", "small-business", "driving-licence-renewal", "property-registration", "society-registration"];
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_BROWSER_CHANNEL || "chrome", headless: true });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  for (const width of [768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of ["light", "dark"]) for (const id of ids) {
      await page.goto(base + `/app/goals/${id}/roadmap`);
      await page.waitForFunction(() => Object.keys(document.querySelector("select") || {}).some((key) => key.startsWith("__reactProps$")));
      const isDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
      if (isDark !== (theme === "dark")) await page.getByRole("button", { name: "Toggle colour theme" }).click();
      for (const locale of ["en", "hi", "mr"]) {
        await page.getByRole("combobox", { name: "Roadmap language" }).selectOption(locale);
        await page.waitForTimeout(250);
        const overflow = await page.locator(".civic-node-content").evaluateAll((nodes) => nodes.filter((node) => node.scrollWidth > node.clientWidth + 1 || node.scrollHeight > node.clientHeight + 1).map((node) => node.textContent));
        const outsideCard = await page.locator(".react-flow__node").evaluateAll((nodes) => nodes.filter((node) => {
          const card = node.getBoundingClientRect(), content = node.querySelector(".civic-node-content")?.getBoundingClientRect();
          return content && (content.right > card.right + 1 || content.bottom > card.bottom + 1);
        }).map((node) => node.dataset.id));
        if (outsideCard.length) throw new Error(`Content extends outside cards: ${id} ${locale}: ${outsideCard.join(", ")}`);
        if (await page.locator(".react-flow__minimap-node").count() !== await page.locator(".react-flow__node").count()) throw new Error(`Minimap is missing procedure nodes: ${id}`);
        if (overflow.length) throw new Error(`Node content overflow: ${width} ${theme} ${id} ${locale}: ${overflow.join("; ")}`);
        const overlap = await page.locator(".react-flow__node").evaluateAll((nodes) => {
          const boxes = nodes.map((node) => ({ id: node.dataset.id, box: node.getBoundingClientRect() }));
          const collisions = [];
          for (let first = 0; first < boxes.length; first++) for (let second = first + 1; second < boxes.length; second++) {
            const a = boxes[first], b = boxes[second];
            if (Math.min(a.box.right, b.box.right) - Math.max(a.box.left, b.box.left) > 1 && Math.min(a.box.bottom, b.box.bottom) - Math.max(a.box.top, b.box.top) > 1) collisions.push(`${a.id}/${b.id}`);
          }
          return collisions;
        });
        if (overlap.length) throw new Error(`Overlapping graph cards: ${id} ${locale}: ${overlap.join(", ")}`);
        if (await page.locator(".react-flow__node").count() < 6) throw new Error(`Missing graph nodes: ${id}`);
      }
      console.log(`PASS ${width}px ${theme} ${id}: all language controls, no node overflow or overlap`);
    }
  }
  if (errors.length) throw new Error(errors.join("\n"));
  console.log("PASS React Flow cards across six procedures, three widths, light/dark and English/Hindi/Marathi UI");
} finally { await browser.close(); }
