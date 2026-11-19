import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildSite, loadConfig, renderPage, themeCss, slug, SECTION_TYPES } from '../src/index.mjs';

const site = await loadConfig(new URL('../example/site.config.mjs', import.meta.url).pathname);

test('every section type renders, with the app’s header and footer', () => {
  const used = new Set(Object.values(site.pages).flatMap((p) => p.sections.map((s) => s.type)));
  for (const t of SECTION_TYPES.filter((t) => t !== 'reels' && t !== 'html' && t !== 'cards')) assert.ok(used.has(t), `example uses ${t}`);
  const html = renderPage(site, 'features');
  assert.match(html, /<header class="hd">/);
  assert.match(html, /<img src="\/logo.png" alt="Sample App">/);
  assert.match(html, /<footer>.*© 2026 Sample App.*v1.0/s);
  assert.match(html, /<td class="pp y">✓<\/td>/);
});

test('the current page is marked in the header, a link with # never is', () => {
  const html = renderPage(site, 'privacy');
  assert.match(html, /<a href="\/privacy" aria-current="page">Privacy<\/a>/);
  assert.doesNotMatch(html, /href="\/features" aria-current/);
});

test('only the icons a page uses are in its sprite, and an unknown icon is an error', () => {
  const html = renderPage(site, 'support');
  assert.match(html, /id="i-mail"/);
  assert.doesNotMatch(html, /id="i-zap"/);
  const bad = { ...site, pages: { x: { sections: [{ type: 'welcome', icon: 'nope', title: 'Hi' }] } } };
  assert.throws(() => renderPage(bad, 'x'), /unknown icon "nope"/);
  assert.throws(() => renderPage({ ...site, pages: { x: { sections: [{ type: 'nope' }] } } }, 'x'), /unknown section type/);
});

test('an app can add its own icons', () => {
  const s = { ...site, icons: { star: '<circle cx="12" cy="12" r="5"/>' }, pages: { x: { sections: [{ type: 'welcome', icon: 'star', title: 'Hi' }] } } };
  assert.match(renderPage(s, 'x'), /<symbol id="i-star" viewBox="0 0 24 24"><circle/);
});

test('policy: an index of the sections, numbered, with ids from the titles', () => {
  const html = renderPage(site, 'privacy');
  assert.match(html, /<a href="#what-we-collect">What We Collect<\/a>/);
  assert.match(html, /<section id="why-we-collect-it" class="callout"><h2>2. Why We Collect It<\/h2>/);
  assert.equal(slug('Where It’s <em>Stored</em>'), 'where-it-s-stored');
});

test('theme: known keys become CSS variables, a typo is an error', () => {
  assert.equal(themeCss({ accent: '#123456' }), ':root{--accent:#123456}\n');
  assert.equal(themeCss({}), '');
  assert.throws(() => themeCss({ accnt: '#000' }), /unknown theme key "accnt"/);
});

test('attribute values are escaped', () => {
  const s = { ...site, pages: { x: { sections: [{ type: 'support', items: [{ icon: 'mail', title: 'T', href: '"><script>' }] }] } } };
  assert.match(renderPage(s, 'x'), /href="&quot;&gt;&lt;script&gt;"/);
});

test('buildSite writes each page and site.css with the theme on top', async () => {
  const out = await mkdtemp(join(tmpdir(), 'site-'));
  const files = await buildSite(site, out);
  assert.equal(files.length, 5);
  const css = await readFile(join(out, 'site.css'), 'utf8');
  assert.match(css, /\.hd\{/);
  assert.match(css, /:root\{--accent:#2f5bd3/);
});

test('about: story, facts and people, with the About link marked in the header', () => {
  const html = renderPage(site, 'about');
  assert.match(html, /<a href="\/about" aria-current="page">About<\/a>/);
  assert.match(html, /<div class="wrap story">\n<div class="art"><img src="\/icon.png" alt=""><\/div>/);
  assert.match(html, /<p class="sig">— The Sample App team<\/p>/);
  assert.match(html, /<div class="facts n3"><div><b>2026<\/b><span>Started<\/span><\/div>/);
  assert.match(html, /<span class="av" aria-hidden="true">SM<\/span><h3>Sample Maker<\/h3><p class="role">Founder<\/p>/);
});

test('about sections are optional: a story with no image is one column, reverse swaps sides', () => {
  const s = { ...site, pages: { x: { sections: [{ type: 'story', title: 'Hi', text: 'Only words.' }, { type: 'story', reverse: true, icon: 'heart', title: 'Two' }] } } };
  const html = renderPage(s, 'x');
  assert.match(html, /<div class="wrap story solo">/);
  assert.match(html, /<p>Only words.<\/p>/);
  assert.match(html, /<div class="wrap story rev">/);
  assert.match(html, /id="i-heart"/);
});
