/**
 * Turns an app's site config into finished HTML pages (Features, Privacy, Support, About, or any page). The kit owns the layout (header, sections, footer); the app owns
 * every word, link, logo and colour. Text fields are the app's own trusted copy and may hold simple inline HTML
 * (<br>, <em>, <b>, <a>). Only attribute values (links, image paths, alt text) are escaped.
 */
import { ICONS } from './icons.mjs';

/** Escapes a value for use inside an HTML attribute. */
export const attr = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Turns a title into a short id: "What We Collect" -> "what-we-collect". */
export const slug = (t) => String(t).replace(/<[^>]+>/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Theme keys an app may set, mapped to the CSS variables in layout.css. */
export const THEME_VARS = {
  ink: '--ink', body: '--body', sub: '--sub', mute: '--mute', line: '--line', soft: '--soft',
  accent: '--accent', accentBright: '--accent-bright', accentSoft: '--accent-soft', glow: '--glow',
  night: '--night', night2: '--night2', heroMid: '--hero-mid', heroDeep: '--hero-deep',
  darkText: '--dark-text', darkSub: '--dark-sub', darkMute: '--dark-mute', darkLink: '--dark-link',
  gold: '--gold', gold2: '--gold2', radius: '--r',
};

/** The :root override for an app's theme, or '' when it sets none. Unknown keys are an error, so a typo never fails quietly. */
export function themeCss(theme = {}) {
  const parts = Object.entries(theme).map(([k, v]) => {
    const name = THEME_VARS[k];
    if (!name) throw new Error(`app-site-kit: unknown theme key "${k}". Known: ${Object.keys(THEME_VARS).join(', ')}`);
    return `${name}:${v}`;
  });
  return parts.length ? `:root{${parts.join(';')}}\n` : '';
}

/** Renders one page. `site` is the whole config, `id` the page's key in site.pages. */
export function renderPage(site, id) {
  const page = site.pages[id];
  if (!page) throw new Error(`app-site-kit: no page "${id}"`);
  const icons = { ...ICONS, ...(site.icons ?? {}) };
  const used = new Set();
  const icon = (name, size = 22) => {
    if (!name) return '';
    if (!icons[name]) throw new Error(`app-site-kit: unknown icon "${name}" on page "${id}"`);
    used.add(name);
    return `<svg class="i" width="${size}" height="${size}" aria-hidden="true"><use href="#i-${attr(name)}"/></svg>`;
  };
  const tint = (t) => (t ? ` style="background:${attr(t[0])};color:${attr(t[1])}"` : '');
  const ctx = { site, page, id, icon, tint };
  const body = (page.sections ?? []).map((s, i) => {
    const fn = SECTIONS[s.type];
    if (!fn) throw new Error(`app-site-kit: unknown section type "${s.type}" on page "${id}" (known: ${Object.keys(SECTIONS).join(', ')})`);
    return fn(s, ctx, i);
  }).join('\n');
  const sprite = used.size
    ? `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>\n${[...used].map((n) => `<symbol id="i-${attr(n)}" viewBox="0 0 24 24">${icons[n]}</symbol>`).join('\n')}\n</defs></svg>`
    : '';
  const b = site.brand ?? {};
  const css = site.cssHref ?? '/site.css';
  const ver = site.cssVersion ? `?v=${attr(site.cssVersion)}` : '';
  return `<!doctype html>
<html lang="${attr(site.lang ?? 'en')}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${page.title ?? b.name ?? ''}</title>
${page.description ? `<meta name="description" content="${attr(page.description)}">\n<meta property="og:description" content="${attr(page.description)}">\n` : ''}<meta property="og:title" content="${attr(page.title ?? b.name ?? '')}">
${site.theme?.night ? `<meta name="theme-color" content="${attr(site.theme.night)}">\n` : ''}${b.icon ? `<link rel="icon" href="${attr(b.icon)}"><link rel="apple-touch-icon" href="${attr(b.icon)}">\n` : ''}<link rel="stylesheet" href="${attr(css)}${ver}">
</head><body>
${sprite}
${header(site, id)}
<main>
${body}
</main>
${footer(site, id, page)}
${page.sections?.some((s) => s.type === 'reels') ? REEL_SCRIPT : ''}</body></html>
`;
}

const current = (link, id) => (link.page === id && !String(link.href ?? '').includes('#') ? ' aria-current="page"' : '');
const linkTag = (l, id) => `<a href="${attr(l.href)}"${current(l, id)}>${l.label}</a>`;

function header(site, id) {
  const h = site.header ?? {};
  const logo = h.logo ? `<a class="wm" href="${attr(h.logo.href ?? '/')}"><img src="${attr(h.logo.src)}" alt="${attr(h.logo.alt ?? site.brand?.name ?? '')}"${h.logo.width ? ` width="${attr(h.logo.width)}"` : ''}${h.logo.height ? ` height="${attr(h.logo.height)}"` : ''}></a>` : '';
  const links = (h.links ?? []).map((l) => linkTag(l, id)).join('');
  return `<header class="hd"><div class="wrap">
${logo}
${links ? `<nav class="top" aria-label="Site">${links}</nav>` : ''}
</div></header>`;
}

function footer(site, id, page) {
  const f = site.footer ?? {};
  const logo = f.logo ? `<img class="flogo" src="${attr(f.logo.src)}" alt="${attr(f.logo.alt ?? site.brand?.name ?? '')}">` : '';
  const links = (f.links ?? []).map((l) => linkTag(l, id)).join('');
  const note = page.version ?? f.note;
  return `<footer><div class="wrap">${logo}${links ? `<nav aria-label="Footer">${links}</nav>` : ''}${f.text ? `<span>${f.text}</span>` : ''}${note ? `<span class="ver">${note}</span>` : ''}</div></footer>`;
}

/** The centred heading block most sections start with. */
const intro = (s, hid, { eyebrow = true } = {}) =>
  s.title || s.eyebrow || s.text
    ? `<div class="intro">${s.badge ? `${s.badge}` : ''}${eyebrow && s.eyebrow ? `<p class="eyebrow">${s.eyebrow}</p>` : ''}${s.title ? `<h2 id="${hid}">${s.title}</h2>` : ''}${s.text ? `<p>${s.text}</p>` : ''}</div>`
    : '';
const labelled = (s, hid) => (s.title ? ` aria-labelledby="${hid}"` : '');
const idOf = (s) => (s.id ? ` id="${attr(s.id)}"` : '');

const stage = (s, { icon, tint }) => {
  if (!s.image) return '';
  const mini = s.chips?.length ? '' : ' mini';
  const rings = mini ? [220, 330] : [260, 400, 560];
  const chips = (s.chips ?? []).map((c, i) => `<div class="chip c${i + 1}"><span class="t"${tint(c.tint)}>${icon(c.icon)}</span><span><b>${c.title}</b>${c.text ? `<small>${c.text}</small>` : ''}</span></div>`).join('\n');
  return `<div class="stage${mini}" aria-hidden="true"><span class="glow"></span>${rings.map((r) => `<span class="ring" style="width:${r}px;height:${r}px"></span>`).join('')}<img class="big" src="${attr(s.image)}" alt="">${chips ? `\n${chips}` : ''}</div>`;
};

const SECTIONS = {
  /** The dark top of the page: eyebrow, big title (<em> for the gold words), line, button, app image with rings, promises. */
  hero(s, ctx, i) {
    const hid = `hero-h${i ? i : ''}`;
    const cta = s.cta ? `<div class="cta"><a class="link" href="${attr(s.cta.href)}">${s.cta.label} ${ctx.icon('arrow')}</a></div>` : '';
    const promises = s.promises?.length
      ? `<div class="promises">${s.promises.map((p) => `<div><span class="ic">${ctx.icon(p.icon)}</span><b>${p.title}</b><span>${p.text}</span></div>`).join('')}</div>`
      : '';
    const pad = s.image && s.chips?.length ? '' : ' style="padding-bottom:56px"';
    return `<section class="hero"${idOf(s)} aria-labelledby="${hid}"${pad}><div class="wrap">
${s.eyebrow ? `<p class="eyebrow">${s.eyebrow}</p>` : ''}
<h1 id="${hid}">${s.title}</h1>
${s.text ? `<p class="sub">${s.text}</p>` : ''}
${cta}${s.fine ? `<p class="fine">${s.fine}</p>` : ''}
${stage(s, ctx)}
${promises}${s.meta ? `<p class="meta">${s.meta}</p>` : ''}
</div></section>`;
  },
  /** A warm one-liner under the hero. */
  welcome(s, { icon }) {
    return `<section class="welcome"${idOf(s)}><div class="wrap">${s.icon ? `<div class="ic">${icon(s.icon)}</div>` : ''}<b>${s.title}</b>${s.text ? `<p>${s.text}</p>` : ''}</div></section>`;
  },
  /** Three cards, each with a tinted icon, a line and an optional short list ("Team Standup · 9:00 AM"). */
  cards(s, { icon, tint }, i) {
    const hid = `s${i}-h`;
    const cards = s.items.map((c) => `<article class="use"><span class="t"${tint(c.tint)}>${icon(c.icon)}</span><h3>${c.title}</h3>${c.text ? `<p>${c.text}</p>` : ''}${c.rows?.length ? `<ul>${c.rows.map(([a, b]) => `<li>${a}${b ? `<span>${b}</span>` : ''}</li>`).join('')}</ul>` : ''}</article>`).join('\n');
    return `<section class="band${s.soft ? ' soft' : ''}"${idOf(s)}${labelled(s, hid)}><div class="wrap">
${intro(s, hid)}
<div class="cols3">
${cards}
</div>
</div></section>`;
  },
  /** Short portrait films, muted; a tap turns one's sound on. */
  reels(s, _ctx, i) {
    const hid = `s${i}-h`;
    const figs = s.items.map((r) => `<figure${r.premium ? ' class="p"' : ''}><video src="${attr(r.src)}"${r.poster ? ` poster="${attr(r.poster)}"` : ''} autoplay muted loop playsinline preload="metadata" aria-label="${attr(r.label ?? r.caption)}"></video><figcaption>${r.caption}</figcaption></figure>`).join('\n');
    return `<section class="band soft reels"${idOf(s)}${labelled(s, hid)}><div class="wrap">
${intro(s, hid)}
<div class="reel-row">
${figs}
</div>
</div></section>`;
  },
  /** Features in a hairline grid. `premium: true` makes it the dark gold band with a crown badge. */
  grid(s, ctx, i) {
    const hid = `s${i}-h`;
    const cls = s.premium ? 'band dark premium' : s.dark ? 'band dark' : s.soft ? 'band soft' : 'band';
    const badge = s.premium ? `<span class="crown"><svg aria-hidden="true"><use href="#i-crown"/></svg>${s.badge ?? 'Premium'}</span>` : '';
    if (s.premium) ctx.icon('crown');
    const items = s.items.map((f) => `<div><span class="ic">${ctx.icon(f.icon)}</span><h3>${f.title}</h3><p>${f.text}</p></div>`).join('\n');
    return `<section class="${cls}"${idOf(s)}${labelled(s, hid)}><div class="wrap">
${intro({ ...s, badge }, hid, { eyebrow: !s.premium })}
<div class="grid">
${items}
</div>
</div></section>`;
  },
  /** Free vs Premium table. Rows are [name, free, premium]; true shows ✓, false shows –, anything else is shown as is. */
  compare(s, _ctx, i) {
    const hid = `s${i}-h`;
    const cell = (v, pp) => {
      const c = pp ? 'pp' : '';
      if (v === true) return `<td class="${c ? `${c} ` : ''}y">✓</td>`;
      if (v === false || v == null) return `<td class="${c ? `${c} ` : ''}n">–</td>`;
      return `<td${c ? ` class="${c}"` : ''}>${v}</td>`;
    };
    const rows = s.groups.map((g) => `${g.title ? `<tr class="grp"><td colspan="2">${g.title}</td><td class="pp"></td></tr>\n` : ''}${g.rows.map(([n, a, b]) => `<tr><td>${n}</td>${cell(a)}${cell(b, true)}</tr>`).join('\n')}`).join('\n');
    const cols = s.columns ?? {};
    return `<section class="band${s.soft ? ' soft' : ''}"${idOf(s)}${labelled(s, hid)}><div class="wrap narrow">
${intro(s, hid)}
<div class="cmp"><table>
<thead><tr><th scope="col">${cols.feature ?? 'Feature'}</th><th scope="col">${cols.free ?? 'Free'}</th><th scope="col" class="pp"><svg class="cr" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 7l5 4 5-7 5 7 5-4-2 12H4z"/></svg><b>${cols.premium ?? 'PREMIUM'}</b>${cols.tagline ? `<small>${cols.tagline}</small>` : ''}</th></tr></thead>
<tbody>
${rows}
${s.footer ? `<tr class="foot"><td colspan="2"></td><td class="pp">${s.footer}</td></tr>` : ''}
</tbody></table></div>
${s.note ? `<p class="cmp-note">${s.note}</p>` : ''}
</div></section>`;
  },
  /** Questions that open on a tap. */
  faq(s, _ctx, i) {
    const hid = `s${i}-h`;
    return `<section class="band${s.soft === false ? '' : ' soft'}"${idOf(s)}${labelled(s, hid)}><div class="wrap narrow">
${intro(s, hid)}
<div class="faq">
${s.items.map((q) => `<details><summary>${q.q}</summary><p>${q.a}</p></details>`).join('\n')}
</div>
</div></section>`;
  },
  /** Contact cards: email, privacy, anything else. Each is a whole-card link. */
  support(s, { icon }, i) {
    const hid = `s${i}-h`;
    const items = s.items.map((c) => `<a href="${attr(c.href)}"><span class="ic">${icon(c.icon)}</span><h3>${c.title}</h3>${c.text ? `<p>${c.text}</p>` : ''}${c.action ? `<span class="go">${c.action}</span>` : ''}</a>`).join('\n');
    return `<section class="band${s.soft ? ' soft' : ''}"${idOf(s)}${labelled(s, hid)}><div class="wrap narrow">
${intro(s, hid)}
<div class="support${s.items.length === 3 ? ' c3' : ''}">
${items}
</div>
</div></section>`;
  },
  /**
   * A long document (the privacy policy): a sticky "On This Page" index beside numbered sections. Each section has a title and
   * either `html` (its paragraphs) or `blocks`: [{ h: 'Sub title', p: 'Text' }], `list` (bold-led lines) or `callout: true`
   * with `points` (the dark box with ticks).
   */
  policy(s) {
    const secs = s.sections.map((x, n) => ({ ...x, id: x.id ?? slug(x.title), num: s.numbered === false ? '' : `${n + 1}. ` }));
    const toc = `<nav class="toc" aria-label="On this page"><b>${s.tocTitle ?? 'On This Page'}</b>${secs.map((x) => `<a href="#${attr(x.id)}">${x.short ?? x.title}</a>`).join('')}</nav>`;
    const inner = (x) => {
      if (x.callout) return `<ul>${(x.points ?? []).map((p) => `<li>${p}</li>`).join('\n')}</ul>`;
      let out = x.intro ? `<p>${x.intro}</p>\n` : '';
      if (x.blocks) out += x.blocks.map((b) => `${b.h ? `<h3>${b.h}</h3>\n` : ''}${b.p ? (Array.isArray(b.p) ? b.p : [b.p]).map((p) => `<p>${p}</p>`).join('\n') : ''}`).join('\n');
      if (x.list) out += `<ul class="who">\n${x.list.map((l) => `<li>${l}</li>`).join('\n')}\n</ul>`;
      if (x.after) out += `\n<p>${x.after}</p>`;
      if (x.html) out += x.html;
      return out;
    };
    const doc = secs.map((x) => `<section id="${attr(x.id)}"${x.callout ? ' class="callout"' : ''}><h2>${x.num}${x.title}</h2>\n${inner(x)}\n</section>`).join('\n\n');
    return `<section class="band"${idOf(s)}><div class="wrap policy">
${toc}
<div class="doc">
${doc}
</div>
</div></section>`;
  },
  /**
   * About: the app's story. An image (or icon) on one side, a title and paragraphs on the other. `reverse: true` puts the
   * image on the right. `paragraphs` is a list; `signature` is an optional sign-off line ("— The PAL team").
   */
  story(s, { icon }, i) {
    const hid = `s${i}-h`;
    const art = s.image
      ? `<div class="art"><img src="${attr(s.image)}" alt="${attr(s.alt ?? '')}"></div>`
      : s.icon ? `<div class="art"><span class="ic">${icon(s.icon, 44)}</span></div>` : '';
    const paras = (s.paragraphs ?? (s.text ? [s.text] : [])).map((p) => `<p>${p}</p>`).join('\n');
    return `<section class="band${s.soft ? ' soft' : ''}"${idOf(s)}${labelled(s, hid)}><div class="wrap story${s.reverse ? ' rev' : ''}${art ? '' : ' solo'}">
${art}
<div class="words">${s.eyebrow ? `<p class="eyebrow">${s.eyebrow}</p>` : ''}${s.title ? `<h2 id="${hid}">${s.title}</h2>` : ''}
${paras}${s.signature ? `\n<p class="sig">${s.signature}</p>` : ''}</div>
</div></section>`;
  },
  /** About: a row of 2 to 4 big facts ("2026" Started, "4" Languages). Each item is { value, label }. */
  facts(s, _ctx, i) {
    const hid = `s${i}-h`;
    const items = s.items.map((f) => `<div><b>${f.value}</b><span>${f.label}</span></div>`).join('');
    return `<section class="band${s.dark ? ' dark' : s.soft === false ? '' : ' soft'}"${idOf(s)}${labelled(s, hid)}><div class="wrap">
${intro(s, hid)}
<div class="facts n${Math.min(s.items.length, 4)}">${items}</div>
</div></section>`;
  },
  /** About: the people behind the app. Each is { name, role, text, photo? } (initials are shown when there is no photo). */
  people(s, _ctx, i) {
    const hid = `s${i}-h`;
    const initials = (n) => String(n).replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
    const items = s.items.map((p) => `<article class="person">${p.photo ? `<img src="${attr(p.photo)}" alt="${attr(p.alt ?? p.name)}">` : `<span class="av" aria-hidden="true">${initials(p.name)}</span>`}<h3>${p.name}</h3>${p.role ? `<p class="role">${p.role}</p>` : ''}${p.text ? `<p>${p.text}</p>` : ''}</article>`).join('\n');
    return `<section class="band${s.soft ? ' soft' : ''}"${idOf(s)}${labelled(s, hid)}><div class="wrap narrow">
${intro(s, hid)}
<div class="people${s.items.length === 1 ? ' one' : ''}">
${items}
</div>
</div></section>`;
  },
  /** The closing dark band: app image, a big line, a small line. */
  final(s, _ctx, i) {
    const hid = `s${i}-h`;
    return `<section class="band dark final"${idOf(s)}${labelled(s, hid)}><div class="wrap">
${s.image ? `<img src="${attr(s.image)}" alt="" width="104" height="104">` : ''}
<h2 id="${hid}">${s.title}</h2>
${s.text ? `<p>${s.text}</p>` : ''}
</div></section>`;
  },
  /** Anything else, as the app's own HTML inside a band. */
  html(s) {
    return `<section class="band${s.soft ? ' soft' : ''}"${idOf(s)}><div class="wrap${s.narrow ? ' narrow' : ''}">
${s.html}
</div></section>`;
  },
};

export const SECTION_TYPES = Object.keys(SECTIONS);

const REEL_SCRIPT = `<script>
document.querySelectorAll('.reels video').forEach(function(v){
  var f=v.parentNode;f.classList.add('muted');
  v.addEventListener('click',function(){
    var on=v.muted;document.querySelectorAll('.reels video').forEach(function(o){o.muted=true;o.parentNode.classList.add('muted')});
    if(on){v.muted=false;f.classList.remove('muted');v.play()}
  });
});
</script>
`;
