import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { renderPage, themeCss } from './render.mjs';

const here = dirname(fileURLToPath(import.meta.url));

/** The kit's stylesheet with the app's theme on top. */
export async function siteCss(site) {
  const base = await readFile(join(here, 'layout.css'), 'utf8');
  return `${base}\n/* The app's own colours (site.config.mjs theme). */\n${themeCss(site.theme)}${site.extraCss ?? ''}`;
}

/** Writes every page in site.pages as <id>.html, plus site.css, into outDir. Returns the files written. */
export async function buildSite(site, outDir) {
  await mkdir(outDir, { recursive: true });
  const files = [];
  for (const id of Object.keys(site.pages)) {
    const file = join(outDir, `${id}.html`);
    await writeFile(file, renderPage(site, id));
    files.push(file);
  }
  const css = join(outDir, (site.cssHref ?? '/site.css').replace(/^\//, ''));
  await writeFile(css, await siteCss(site));
  files.push(css);
  return files;
}

/** Loads site.config.mjs (its default export) from a path. */
export async function loadConfig(path) {
  const mod = await import(pathToFileURL(resolve(path)).href + `?t=${Date.now()}`);
  return mod.default ?? mod.site;
}
