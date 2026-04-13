# Scrape notes — https://seum.online/

**Scraped:** 2026-04-13  
**Title:** SEUM | Global Activity  
**Type:** Gaming stats dashboard — live activity feed, leaderboards, and hall of fame for the speedrun game SEUM  
**Sections:** 7 blocks (hero + 6 content panels)

---

## Floating elements / overlays

| Kind | Selector | Position | Behaviour | Decision |
|------|----------|----------|-----------|----------|
| Slide-out nav | `#sidebar` | fixed, left edge, z-index 2000 | Closed by default (width 1px), opens on hamburger click | **Hide for section shots** |
| Hamburger button | `div.menu-btn` | fixed, top: 25px, left: 30px, z-index 1001 | Opens `#sidebar` | Keep visible (part of UI, small) |

No cookie banners, no popups, no overlays detected.

---

## Hide list for sections

```
#sidebar
```

---

## Header structure

**No traditional top header bar.** Navigation lives in a slide-out `#sidebar` (fixed, full-height left panel).

- Sidebar links: HOME · FEED · GLOBAL RANKINGS · LEVEL SETUPS · VOCABULARY · MUTATOR STATS · POLLS · WORLD RECORDS · SEARCH PLAYER · LOGIN
- Opened/closed by `div.menu-btn` (hamburger icon, top-left corner)
- Default state: sidebar is collapsed (width ≈ 1px, invisible)
- The `×` at top of sidebar closes it

**Mobile:** Same hamburger + slide-out pattern. No breakpoint-specific header variant.

---

## DOM structure

```
body  (bg: #0d0d10 + radial-gradient glow)
├── <style>  ← inline CSS incl. Google Fonts @import
├── #sidebar.sidebar  ← fixed, slide-out nav
├── div.menu-btn  ← fixed hamburger (top-left)
├── div.hero  ← hero block
│   ├── h1  "SEUM STATS"  (Metal Mania, gradient text)
│   ├── p   "GLOBAL RANKINGS & HISTORY"
│   └── div  ← two CTA buttons
└── div.container
    └── div.main-content  ← 3-column CSS Grid
        ├── div.left-sidebar
        │   ├── div.info-box  ← Overall Stats
        │   └── div.info-box  ← Server Pulse
        ├── div.feed-column
        │   ├── div.feed-header  "GLOBAL ACTIVITY"
        │   ├── div.feed-filters  (tab bar)
        │   └── div#feed-container.feed-list  ← live feed items
        └── div.right-sidebar
            ├── a.discord-box  ← Discord CTA
            ├── div.info-box  ← Weekly Hall of Fame
            └── div.info-box  ← Top 10 Leaderboard
```

---

## Sections inventory

| # | Folder | Selector | Role | Notes |
|---|--------|----------|------|-------|
| 0 | `section-0-seum-stats` | `div.hero` | Hero | Title + subtitle + 2 CTA buttons. Gradient text on h1. |
| 1 | `section-1` | `.left-sidebar > .info-box:nth-of-type(1)` | Overall Stats | Steam logo bg (decorative). 3 metrics: In-Game Now, All-Time Peak, Tracked Runs. |
| 2 | `section-2` | `.left-sidebar > .info-box:nth-of-type(2)` | Server Pulse | Line chart (last 30 days). Red sparkline on dark bg. |
| 3 | `section-3` | `.feed-column` | Global Activity feed | Tab filters (ALL / WORLD RECORDS / TOP 10 (24h) / COMMENTS) + live feed rows. Each row has Steam avatar, player name, level, time, rank badge, pts badge. |
| 4 | `section-4` | `a.discord-box` | Discord CTA | Full-width banner button. Purple Discord accent. |
| 5 | `section-5` | `.right-sidebar > .info-box:nth-of-type(1)` | Weekly Hall of Fame | 4 award rows: MVP (Points) · WR Breaker · Most Active · Most Top 10s. Each has icon + player name + stat. |
| 6 | `section-6` | `.right-sidebar > .info-box:nth-of-type(2)` | Top 10 Leaderboard | Numbered list #1–#10. Player name + score. "VIEW FULL RANKINGS →" link at bottom. |

---

## Assets roles

**Saved (3):** Steam player avatar JPGs from `avatars.steamstatic.com` — used in feed rows and Hall of Fame.

**Failed 403 (4):** Game-specific icons hosted at `/static/images/`:
- `icon-mvp.png` — trophy/MVP icon (Hall of Fame MVP row)
- `icon-wr.png` — world record icon (Hall of Fame WR row)
- `icon-fire.png` — fire icon (Hall of Fame Most Active row)
- `icon-star.png` — star icon (Hall of Fame Most Top 10s row)

These 4 icons need to be recreated or sourced for the build — they're small decorative award icons (~32–48px). Consider SVG replacements.

---

## Typography

| Element | Family | Weight | Notes |
|---------|--------|--------|-------|
| Hero `h1` ("SEUM STATS") | Metal Mania | 400 | Display/cursive; gradient text via `background-clip: text` |
| All other headings + body | Rajdhani | 400 / 600 / 700 | Geometric sans-serif with a sci-fi edge |

**Loaded via:** `@import url('https://fonts.googleapis.com/css2?family=Metal+Mania&family=Rajdhani:wght@400;600;700&display=swap')` inside inline `<style>` tag. No `@font-face` / no `.woff2` files downloaded — use Google Fonts CDN link in build.

Approximate sizes (desktop):
- `h1` "SEUM STATS": ~80–96px
- Section headings (`.info-box` titles, `.feed-header`): ~22–28px, Rajdhani 700
- Feed item player name: ~16px, Rajdhani 600
- Labels / timestamps: ~13–14px, Rajdhani 400
- Stat numbers (All-Time Peak etc.): ~36–42px, Rajdhani 700

---

## Colors

| Token | Hex | Usage |
|-------|-----|-------|
| bg-base | `#0d0d10` | Body background |
| bg-card | `rgba(20,20,25,0.6)` | Info box / panel background |
| bg-feed-item | `rgba(20,20,25,0.4)` | Individual feed row background |
| accent-primary | `#e94560` | Hover states, active tab highlight, radial glow on body bg |
| hero-gradient-top | `#ffae00` | Top of h1 gradient |
| hero-gradient-mid | `#ff4500` | Mid of h1 gradient |
| hero-gradient-bot | `#8b0000` | Bottom of h1 gradient |
| text-primary | `#dcdcdc` | Default text, feed header |
| text-muted | `#888888` | Labels, subtitles, button borders |
| green-live | `#00ff00` (approx) | "IN-GAME NOW" dot + number |
| cyan-link | `#00e5ff` (approx) | "VIEW ON STEAMDB →" and similar links |
| badge-rank | orange/red | Rank badge backgrounds in feed |
| badge-pts-pos | green | Positive points badge in feed |
| discord-purple | `#5865f2` (approx) | Discord box accent |

Body also has: `background-image: radial-gradient(circle at 10% 20%, rgba(233,69,96,0.05) ...)` — subtle reddish top-left glow.

---

## Known issues / TODO for build

1. **4 icon images (403):** `icon-mvp`, `icon-wr`, `icon-fire`, `icon-star` from `/static/` returned 403. Need SVG/PNG replacements for Hall of Fame award rows.
2. **Live dynamic data:** Feed rows, stat numbers, avatar images, leaderboard — all rendered server-side from live DB. For the clone, use placeholder/static data.
3. **Server Pulse chart:** SVG or Canvas line chart (last 30 days). Needs to be recreated as static SVG or simple placeholder.
4. **Steam avatars:** Loaded dynamically from `avatars.steamstatic.com` — will need placeholder images or static samples in the build.
5. **Fonts via `@import`:** Google Fonts not downloaded locally. Add `<link rel="preconnect">` + `<link href="https://fonts.googleapis.com/...">` in `<head>`.
6. **Sidebar animation:** The slide-out nav has a transition — not captured in static PNGs.
7. **Feed tabs:** Switching between ALL / WORLD RECORDS / TOP 10 (24h) / COMMENTS is dynamic (likely AJAX). Clone needs only the default "ALL" state.
8. **Section selector for re-scrape:** `--section-selector=".hero,.info-box,.feed-column,.discord-box"` with `--hide="#sidebar"`.
