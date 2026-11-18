# Changelog

Release notes for app-site-kit, newest first. Each version is tagged in git (`v1.0.0`).

## 1.0.0

- First version: one layout for an app's web pages (Features, Privacy, Support), taken from HringNring's site (v2.4 look).
- The app passes its header (logo, links), footer (logo, links, text, version line), colours (`theme`) and words in `site.config.mjs`.
- Sections: `hero`, `welcome`, `cards`, `reels`, `grid` (`premium: true` for the gold band), `compare`, `faq`, `support`, `policy`, `final`, `html`.
- CLI: `app-site-kit <site.config.mjs> <out folder>` writes `<page>.html` for each page and `site.css`.
