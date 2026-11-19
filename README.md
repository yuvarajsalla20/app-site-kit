# app-site-kit

One layout for an app's web pages: **Features**, **Privacy**, **Support** and **About** (or any page you like). The kit holds the
layout and the look; each app passes only its own header, footer, colours and words. No app re-builds the pages.

The look is HringNring's site (v2.4): a header with the logo centred and page links under it, a dark hero, full-width
bands with lots of air, and a dark footer. Plain HTML and one CSS file, no JavaScript framework, works on Firebase Hosting.

## Use it in an app

1. Add the kit, pinned by the full SHA of its release tag:
   ```json
   "devDependencies": { "app-site-kit": "git+https://github.com/yuvarajsalla20/app-site-kit.git#<sha of v1.0.0>" },
   "scripts": { "site": "app-site-kit site/site.config.mjs public" }
   ```
2. Write `site/site.config.mjs` (see `example/site.config.mjs`, or PAL's for a full one).
3. `npm run site` writes one `<page>.html` per page (`features.html`, `privacy.html`, `support.html`, `about.html`) and `site.css`. Images stay in `public/`.
4. Deploy as before (`firebase deploy --only hosting`). Turn on `"cleanUrls": true` in firebase.json for `/features` links.

## site.config.mjs

```js
export default {
  brand:  { name: 'My App', icon: '/icon.png' },            // tab title fallback and favicon
  theme:  { accent: '#1F7A5C', night: '#04120d', ... },      // optional: colours (keys below)
  header: { logo: { src, alt, href, width, height }, links: [{ label, href, page }] },
  footer: { logo?: { src, alt }, links, text: '© 2026 My App', note?: 'v1.0' },
  icons?: { star: '<path d="…"/>' },                         // optional: your own 24×24 line icons
  pages: {
    features: { title, description?, version?, sections: [ … ] },   // writes features.html
    privacy:  { … },
    support:  { … },
    about?:   { … },                                                // optional: writes about.html
  },
};
```

A link's `page` marks it as the current page in the header. A page's `version` is the small line in its footer.
Text fields are your own copy and may hold simple HTML (`<br>`, `<em>` for the gold words in a title, `<b>`, `<a>`).

### Sections

| type | What it shows | Fields |
|---|---|---|
| `hero` | Dark top: eyebrow, big title, line, button, app image with rings, floating chips or promises | `eyebrow, title, text, cta: {label, href}, fine, image, chips: [{icon, tint: [bg, fg], title, text}], promises: [{icon, title, text}], meta` |
| `welcome` | A warm line under the hero | `icon, title, text` |
| `cards` | Three cards with tinted icons and short lists | `eyebrow, title, text, items: [{icon, tint, title, text, rows: [[left, right]]}]` |
| `reels` | Portrait films, tap for sound | `items: [{src, poster, caption, label, premium}]` |
| `grid` | Features in a hairline grid; `premium: true` = dark gold band with a crown | `eyebrow, title, text, items: [{icon, title, text}], premium, badge, dark, soft` |
| `compare` | Free vs Premium table (`true` = ✓, `false` = –) | `title, columns: {feature, free, premium, tagline}, groups: [{title, rows: [[name, free, premium]]}], footer, note` |
| `faq` | Questions that open on a tap | `eyebrow, title, items: [{q, a}]` |
| `support` | Whole-card links (email, privacy, …), 2 or 3 across | `title, text, items: [{icon, title, text, action, href}]` |
| `policy` | Long document with an "On This Page" index | `sections: [{title, short?, blocks: [{h, p}], list: [...], intro, after, callout: true + points, html}]`, `numbered`, `tocTitle` |
| `story` | About: an image (or icon) beside a title and paragraphs | `eyebrow, title, paragraphs: [...]` (or `text`), `image, alt` or `icon`, `reverse, signature, soft` |
| `facts` | About: 2 to 4 big numbers with labels | `eyebrow, title, text, items: [{value, label}], dark, soft: false` |
| `people` | About: who makes the app (initials when no photo) | `eyebrow, title, text, items: [{name, role, text, photo, alt}], soft` |
| `final` | Closing dark band | `image, title, text` |
| `html` | Your own HTML in a band | `html, soft, narrow` |

Every section also takes `id` (for `#links`).

### Page recipes

Each page is just a list of sections, so an app can mix them freely. The usual four (all in `example/site.config.mjs`):

| Page | Sections, top to bottom |
|---|---|
| Features | `hero` (with chips) · `welcome` · `grid` · `grid premium` · `compare` · `faq` · `final` |
| Privacy | `hero` (with promises and `meta` date) · `policy` |
| Support | `hero` · `support` · `faq` |
| About | `hero` · `story` · `facts` · `grid` (what you believe) · `people` · `support` (say hello) |

A page is only written when the app lists it in `pages`, and a link only shows when the app puts it in `header.links` or
`footer.links`. So an app with no About page simply leaves it out, and nothing changes.

### Theme keys

`ink, body, sub, mute, line, soft, accent, accentBright, accentSoft, glow, night, night2, heroMid, heroDeep, darkText,
darkSub, darkMute, darkLink, gold, gold2, radius`. A key you leave out keeps the kit's colour; an unknown key stops the build.

### Icons

`arrow ban bell book brief camera chart check clock crown down eye eyeoff file gem gift globe grid heart help info lock mail
msg phone pin refresh repeat shield store tag trash trend type user-x users vol watch wind zap`, plus any you add in `icons`.

## Develop

`npm test` (node:test, no installs) · `npm run example` builds the sample site into `example/public`.
