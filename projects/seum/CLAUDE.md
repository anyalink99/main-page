# CLAUDE.md — project working rules

This is a frontend template repo. Two kinds of task show up here: **1-to-1 cloning of a reference site** and **ongoing development / edits** on an existing build. CLAUDE.md covers the rails that apply everywhere. Skill-specific discipline lives in the skills.

## Pipeline

The workflow is a short chain of skills. Each has a dedicated prompt in `.claude/skills/<name>/SKILL.md`:

1. **`scraper`** — pull a live reference site into `branding/scraped/` (DOM analysis, screenshots, deduped images, filtered fonts, hand-written `_notes.md`). **Required first step** when cloning; without it the cloner has no structured references.
2. **`clone-site`** — strict 1-to-1 reproduction of the scraped reference into plain `index.html` + `css/style.css` + `assets/`.
3. **`checkup`** — targeted audit of an existing build against `branding/scraped/`. Either a quick whole-page sweep, or a deeper dive into specific blocks the user named.
4. **`polish`** — finishing pass on a build that's already structurally done. Reference-free: trusts the current build and makes it feel crafted (tokens, sticky header, loader, reveals, responsive re-check).

`checkup` and `polish` can run standalone on an existing build. `clone-site` requires `scraper` to have produced `branding/scraped/`.

## What you do NOT do
- **Don't hallucinate.** Unsure about a value, filename or structure — check the source or ask.
- **Don't change the project's established style without being asked.** If `index.html` / `css/style.css` already follow conventions (BEM-style classes, specific CSS custom properties, a section layout approach, a breakpoint strategy) — follow them. That goes for colours, typography, markup idioms.
- **Don't add abstractions "for the future".** Three near-identical lines beat a premature helper. A component exists when it's requested or when it's actually reused.
- **Don't "improve" the design on the side.** If the user didn't ask you to redesign something, don't. Fix bugs, add requested features; anything else goes through them.
- **Don't reach for Tailwind or utility-CSS frameworks.** This project is plain CSS. Classes are meaningful (`.hero`, `.hero__title`, `.nav-link`). If `:root` already defines CSS custom properties — use them, don't re-inline hex values.

## When you're sure, do it; when you're not, ask
The user deliberately keeps Claude on a tight leash in this project to prevent drift and cruft. When a task is inside the existing logic (add a nav item, shrink the hero h1 on mobile, extract `.card` into its own block) — act with confidence, referencing the code that's already there. When a task needs a new design decision (a colour that doesn't exist, a font, a section that's not in the reference) — stop and clarify.

## Assets and fonts

**Source #1 — `branding/scraped/`** (if present):
- Images: `branding/scraped/images/section-N-slug/`, plus `images/other/`. Role/usage data is in `_manifest.json` and described in `_notes.md`.
- Fonts: `branding/scraped/fonts/*.woff2` with `_fonts.json` listing family/weight/style/usage.
- For cloning, this is the only allowed source.

**Source #2 — `assets/images/` and `assets/fonts/`** (what's already been brought into the build). When editing existing code, use the files that are already there; bring new ones in from `branding/scraped/`.

**Last-resort fallbacks:**
- `placehold.co` / `picsum.photos` are acceptable only when, during cloning/building, you genuinely cannot tell which image belongs in a slot, or the asset isn't in the scrape and the section collapses without one. Mark it with an HTML comment `<!-- TODO: replace placeholder -->` so the user notices.
- **Google Fonts CDN** is acceptable only when `branding/scraped/fonts/` doesn't contain the family you need and re-scraping isn't an option. Prefer local `@font-face`.

These aren't a low bar — just the honest acknowledgement that sometimes you can't move without a stand-in. Always mark such places.

## Markup, styles and interactions

- **Animations**: only `transform` and `opacity`. Never `transition: all` — it costs performance and transitions properties you didn't intend to move.
- **Interactive elements**: every clickable thing (buttons, links, form controls) needs `:hover`, `:focus-visible`, `:active`. Without those states, the work is unfinished.
- **Semantics**: `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`; headings in order (one `<h1>` per page, then `<h2>`/`<h3>` inside sections). Don't wrap everything in `<div>`.
- **Alt text** is required on content images; decorative ones get `alt=""`.

## Local server and screenshots

- **Server**: `node serve.mjs` on `:3000`. If the port is busy, the server's already running — don't start a second one.
- **Local screenshots** (`screenshot.mjs`):
  ```bash
  node screenshot.mjs http://localhost:3000 <label> --multi-device --profile=standard                   # full pages, 5 BP
  node screenshot.mjs http://localhost:3000 <label> --sections --multi-device --profile=standard        # per-section, 5 BP
  node screenshot.mjs http://localhost:3000 <label> --el="<sel>" --device=desktop                       # isolated block
  node screenshot.mjs http://localhost:3000 <label> --el="<sel>" --device=desktop --context=0.5         # block with context
  ```
  Output lands in `temporary screenshots/`. Read via the Read tool, diff against `branding/scraped/` (or the previous local shot).
- **`scrape.mjs`** takes the same `--profile=` and `--context=` flags — keep scrapes consistent with the local snapshots you'll diff them against.
- **Live reference**: `screenshot.mjs` works directly against external URLs too.

## Compare rules (global — apply everywhere unless a skill overrides)

Scraping, cloning, and checkup all compare images. The rules below are the single source of truth; skills that need an exception call it out explicitly.

### Breakpoint profiles

| Profile    | Breakpoints                                                  | When                                                         |
| ---------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `standard` | mobile 375, tablet 768, laptop 1024, desktop 1440, wide 1920 | **Global default.** Any work against the reference: scrape, clone, whole-page `checkup`. |
| `extended` | all 12 (xs 360 … ultra 2560)                                 | Block-level `checkup` on specific blocks the user named. More BPs justified because there are fewer blocks. |
| `core`     | mobile 375, desktop 1440, wide 1920                          | **Only `polish` self-checkups** after own edits. Never for reference work. |

If a skill doesn't specify a profile — use `standard`.

### Isolated + context pair (mandatory for reference work)

Every block compared against the reference is captured in two variants:

1. **Isolated** — `--el="<selector>"` without context. For typography, paddings, colour detail.
2. **Context** — `--el="<selector>" --context=0.5`. The clip extends vertically by 50% of the previous sibling's height above and 50% of the next sibling's height below. For rhythm, background seams, inter-block spacing.

One without the other is an incomplete compare. In the scrape (`scraper` skill), both variants are always captured and stored separately — isolated in `sections/section-N-*/` and `element/<label>/`, context in the same folders with a `-ctx0.5` suffix.

**Exception — `polish`.** Polish self-audits its own edits (no reference involved) and is free to pick isolated or context per what it's judging.

### Regression check at the end of every cycle (always)

After the last fix cycle of `clone-site` / `checkup` / `polish`, before declaring the work done:

- **One BP — `desktop`.** Not multi-device, not context, not extended.
- **Full-page shot + per-section shots, both together.** Full-page catches inter-block drift (rhythm, seams, container). Per-section catches intra-block drift (padding, type scale). Each without the other misses a class of bugs.
  ```bash
  node screenshot.mjs http://localhost:3000 final-regression --device=desktop
  node screenshot.mjs http://localhost:3000 final-regression --sections --device=desktop
  ```
- **Walk every block that was NOT touched in the current cycle** and confirm it still matches the reference (or, for polish, still matches the intended look from before this polish pass). Regressions usually hide in blocks the latest fix wasn't aimed at — e.g. a `:root` tweak grabs two unrelated sections.
- **Found a regression → one targeted fix + re-shoot that block + re-shoot full-page. Done.** Do not open a new cycle. Regression check is strictly 1 BP.

## `_notes.md`
If `branding/scraped/` exists, `_notes.md` is the hand-written artefact (section roles, header structure, typography, palette, known issues). Read it first — the PNGs and JSON files lose context without it. If the folder exists but the notes are empty, ask the user to fill them in or to re-run `scrape` (the `scraper` skill).

## Vue port
Until the user explicitly asks for it — not your task. Stay in plain HTML / CSS / JS.
