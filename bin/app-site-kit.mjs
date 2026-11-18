#!/usr/bin/env node
// Usage: app-site-kit <site.config.mjs> <out folder>
// Example (PAL): npx app-site-kit site/site.config.mjs public
import { buildSite, loadConfig } from '../src/build.mjs';

const [config, out] = process.argv.slice(2);
if (!config || !out) {
  console.error('Usage: app-site-kit <site.config.mjs> <out folder>');
  process.exit(1);
}
const files = await buildSite(await loadConfig(config), out);
for (const f of files) console.log(`wrote ${f}`);
