import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
const playwrightImport = process.env.PLAYWRIGHT_MODULE_PATH ? pathToFileURL(path.join(process.env.PLAYWRIGHT_MODULE_PATH, 'index.mjs')).href : 'playwright';
const { chromium } = await import(playwrightImport);
const baseURL = process.env.CIVICFLOW_BASE_URL || 'http://127.0.0.1:3000';
const artifacts = process.env.CIVICFLOW_ARTIFACTS || path.join(os.tmpdir(), 'civicflow-smoke');
fs.mkdirSync(artifacts, { recursive: true });
(async () => {
  const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_BROWSER_CHANNEL || 'chrome', headless: true });
  try {
  const page = await browser.newPage({ viewport: { width: 375, height: 812 }, colorScheme: 'light' });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if(message.type() === 'error') errors.push(message.text()); });
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: width < 768 ? 812 : 900 });
    for (const route of ['/', '/services', '/demo', '/app', '/app/goals/home-food-business/roadmap', '/admin', '/login', '/how-it-works', '/about', '/privacy', '/disclaimer']) {
      const response = await page.goto(baseURL + route);
      await page.waitForFunction(() => Object.keys(document.querySelector('button') || {}).some(key => key.startsWith('__reactProps$')));
      await page.waitForTimeout(300);
      const overflow = await page.evaluate(() => ({ width: innerWidth, doc: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
      if (overflow.doc > width + 1 || overflow.body > width + 1) throw new Error(`Overflow ${route} at ${width}: ${JSON.stringify(overflow)}`);
      if (response.status() !== 200) throw new Error(`${route}: ${response.status()}`);
      console.log(`PASS ${width} ${route}`);
    }
  }
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(baseURL + '/');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(artifacts, 'civicflow-home-mobile.png'), fullPage: true, animations: 'disabled', caret: 'initial' });
  await page.goto(baseURL + '/app/goals/home-food-business/roadmap');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(artifacts, 'civicflow-roadmap-mobile.png'), fullPage: true, animations: 'disabled', caret: 'initial' });
  await page.getByRole('button', { name: 'Determine FSSAI route', exact: true }).click();
  await page.getByRole('dialog').waitFor({ state: 'visible' });
  await page.getByRole('button', { name: 'Mark step complete', exact: true }).last().click();
  await page.getByRole('button', { name: 'Close step details' }).last().click();
  await page.reload();
  await page.waitForFunction(() => Object.keys(document.querySelector('button') || {}).some(key => key.startsWith('__reactProps$')));
      await page.waitForTimeout(300);
  if (!await page.getByText('2 / 7').count()) throw new Error('Progress did not persist');
  await page.getByRole('combobox', { name: 'Roadmap language' }).selectOption('mr');
  await page.getByRole('heading', { name: 'घरगुती खाद्य व्यवसाय सुरू करा' }).waitFor();
  await page.getByRole('combobox', { name: 'Roadmap language' }).selectOption('en');
  await page.goto(baseURL + '/admin');
  for (const tab of ['Overview', 'Sources', 'Claims', 'Procedures', 'Evaluations', 'Audit log', 'Changes']) {
    await page.getByRole('button', { name: tab, exact: tab !== 'Changes' }).click();
    console.log('PASS admin tab ' + tab);
  }
  await page.getByRole('button', { name: 'Approve demo change' }).click();
  await page.reload();
  await page.getByText('approved', { exact: true }).waitFor();
  await page.goto(baseURL + '/app');
  await page.getByText(/synthetic source change was approved/).waitFor();
  await page.goto(baseURL + '/demo?goal=Get%20a%20passport');
  await page.getByRole('heading', { name: 'This goal needs another procedure.' }).waitFor();
  await page.goto(baseURL + '/demo?goal=home-food-business');
  // SSR renders form controls before their React change handlers are attached.
  await page.waitForFunction(() => Object.keys(document.querySelector('select[aria-label="Where will you operate?"]') || {}).some(key => key.startsWith('__reactProps$')));
  await page.getByRole('combobox', { name: 'Where will you operate?' }).selectOption('commercial');
  await page.getByRole('radio', { name: 'Yes', exact: true }).check();
  await page.getByRole('checkbox', { name: /Use the Mumbai, Maharashtra sample jurisdiction/ }).check();
  await page.getByRole('button', { name: 'Compile my roadmap' }).click();
  await page.getByRole('link', { name: 'Open interactive roadmap' }).click();
  await page.getByRole('heading', { name: 'Check commercial premises permissions', exact: true }).first().waitFor();
  await page.getByText('2 / 7', { exact: false }).waitFor();
  await page.getByRole('button', { name: 'Open CivicFlow Copilot' }).click();
  await page.getByRole('button', { name: 'What should I do next?' }).click();
  await page.getByText(/Next: Check commercial premises permissions/).waitFor();
  await page.getByRole('button', { name: 'Close CivicFlow Copilot' }).click();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(baseURL + '/app/goals/home-food-business/roadmap');
  await page.getByRole('button', { name: 'Toggle colour theme' }).click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(artifacts, 'civicflow-roadmap-desktop-dark.png'), fullPage: true, animations: 'disabled', caret: 'initial' });
  console.log('PAGE ERRORS', JSON.stringify(errors));
  if (errors.length) throw new Error(errors.join('\n'));
  console.log('PASS intake, persistence, language, admin review and state-aware assistant');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
