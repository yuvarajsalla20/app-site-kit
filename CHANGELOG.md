# Changelog

Release notes for app-site-kit, newest first. Each version is tagged in git (`v1.0.0`).

## 1.1.0

- About page: three new sections, `story` (image or icon beside a title and paragraphs, `reverse`, `signature`),
  `facts` (2 to 4 big numbers with labels, `dark` or soft) and `people` (who makes the app; initials when there is no photo).
- New icons: `info`, `pin`.
- The example site has an About page and an About link in the header; the README lists the four page recipes.
- Nothing changes for apps that don't use the new sections: their pages are the same as with 1.0.0 (only site.css grows).

## 1.0.0

- First version: one layout for an app's web pages (Features, Privacy, Support), taken from HringNring's site (v2.4 look).
- The app passes its header (logo, links), footer (logo, links, text, version line), colours (`theme`) and words in `site.config.mjs`.
- Sections: `hero`, `welcome`, `cards`, `reels`, `grid` (`premium: true` for the gold band), `compare`, `faq`, `support`, `policy`, `final`, `html`.
- CLI: `app-site-kit <site.config.mjs> <out folder>` writes `<page>.html` for each page and `site.css`.
