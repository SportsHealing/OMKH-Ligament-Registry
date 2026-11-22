// ABP check C4: axe (WCAG 2.2 AA) on every site page, light and dark.
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const skip = new Set(['docs', 'node_modules', '.git', 'scripts']);
const pages = [];
(function walk(d) {
  for (const f of readdirSync(d)) {
    if (skip.has(f)) continue;
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (f.endsWith('.html')) pages.push(resolve(p));
  }
})('.');

const browser = await chromium.launch();
let bad = 0;
for (const scheme of ['light', 'dark']) {
  const ctx = await browser.newContext({ colorScheme: scheme });
  const page = await ctx.newPage();
  for (const p of pages) {
    await page.goto('file://' + p);
    const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    for (const v of r.violations) { bad++; console.log(`FAIL C4 ${scheme} ${p}: ${v.id} (${v.nodes.length})`); }
  }
  await ctx.close();
}
await browser.close();
console.log(bad ? `C4 failed: ${bad} violations` : `C4 passed: ${pages.length} pages, light and dark`);
process.exit(bad ? 1 : 0);
