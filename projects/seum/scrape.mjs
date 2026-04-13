/**
 * scrape.mjs — atomic subcommands for pulling reference from a live URL.
 *
 * Usage:
 *   node scrape.mjs inspect  <url>                                      [--out=path/]
 *   node scrape.mjs full     <url> [--hide="sel1, sel2"] [--profile=core|standard|extended] [--breakpoints=a,b]
 *   node scrape.mjs element  <url> --el="selector"  [--hide="..."]      [--profile=...]  [--context=0.5]
 *   node scrape.mjs sections <url> [--hide="..."]   [--section-selector="section"] [--profile=...] [--context=0.5]
 *   node scrape.mjs images   <url> [--no-dedupe]                       [--out=path/]
 *   node scrape.mjs fonts    <url> [--subsets=latin,latin-ext]         [--out=path/]
 *
 * Breakpoint profiles (use --profile=; default is `standard` when neither --profile nor --breakpoints is set):
 *   core     → mobile, desktop, wide              (3 shots — quick self-checkup only; not for reference work)
 *   standard → mobile, tablet, laptop, desktop, wide   (5 shots — default for reference work)
 *   extended → all 12 (xs … ultra)                (block-level deep audit or container-edge behaviour)
 * --breakpoints=a,b,... still wins if passed explicitly.
 *
 * Context shots (--context=FACTOR, e.g. 0.5):
 *   For `element` and `sections` the clipping region is expanded vertically by FACTOR × height
 *   of the previous sibling above and FACTOR × height of the next sibling below. The block is
 *   then visible WITH 0.5 of its neighbours, so vertical rhythm and gaps between sections
 *   can be judged against the reference (not just the block in isolation).
 *
 * Orchestration (which selectors to hide, asset roles, etc) happens outside this script.
 * Run `inspect` first, then pass the discovered selectors via --hide= to the other commands.
 *
 * `element` extra flags:
 *   --label=<name>        custom folder name under element/ (defaults to slug(selector))
 *   --scroll-to=<px>      scroll page to scrollY=<px> before capturing (use for scrolled-state header)
 *
 * Dedup / filter defaults:
 *   images: collapses same-asset URLs that differ only by `?scale-down-to=N`, keeping the largest
 *           (the query-less original if present). Pass --no-dedupe to keep all variants.
 *   fonts:  keeps only @font-face rules whose unicode-range matches --subsets (default latin,latin-ext)
 *           pass --subsets=all to keep everything.
 *
 * Output defaults to ./branding/scraped/
 */

import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import https from "https";
import http from "http";

// ── CLI parsing ─────────────────────────────────────────────
const argv = process.argv.slice(2);
const command = argv[0];
const urlArg = argv[1];

const flags = {};
for (let i = 2; i < argv.length; i++) {
  const a = argv[i];
  if (a.startsWith("--") && a.includes("=")) {
    const [k, v] = a.split(/=(.+)/);
    flags[k.replace(/^--/, "")] = v;
  } else if (a.startsWith("--")) {
    flags[a.replace(/^--/, "")] = true;
  }
}

const COMMANDS = ["inspect", "full", "element", "sections", "images", "fonts"];

function showUsage() {
  console.error(`Usage:
  node scrape.mjs inspect  <url>                                      [--out=path/]
  node scrape.mjs full     <url> [--hide="..."] [--profile=core|standard|extended] [--breakpoints=a,b]
  node scrape.mjs element  <url> --el="selector" [--hide="..."] [--profile=...] [--context=0.5]
  node scrape.mjs sections <url> [--hide="..."] [--section-selector="section"] [--profile=...] [--context=0.5]
  node scrape.mjs images   <url>                                      [--out=path/]
  node scrape.mjs fonts    <url>                                      [--out=path/]

Profiles: core=3 shots, standard=5, extended=12.  Default = standard.`);
}

if (!command || !COMMANDS.includes(command)) {
  showUsage();
  process.exit(1);
}
if (!urlArg || urlArg.startsWith("--")) {
  console.error("Missing <url>.");
  showUsage();
  process.exit(1);
}

const OUT_DIR = path.resolve(process.cwd(), flags.out || "branding/scraped");
fs.mkdirSync(OUT_DIR, { recursive: true });

const ALL_BREAKPOINTS = [
  { name: "xs",       width: 360,  height: 780 },
  { name: "mobile",   width: 375,  height: 812 },
  { name: "mobile-l", width: 430,  height: 932 },
  { name: "sm",       width: 640,  height: 900 },
  { name: "tablet",   width: 768,  height: 1024 },
  { name: "md",       width: 900,  height: 1200 },
  { name: "laptop",   width: 1024, height: 768 },
  { name: "maxw",     width: 1280, height: 900 },
  { name: "desktop",  width: 1440, height: 900 },
  { name: "xl",       width: 1680, height: 1050 },
  { name: "wide",     width: 1920, height: 1080 },
  { name: "ultra",    width: 2560, height: 1440 },
];
const PROFILES = {
  core:     ["mobile", "desktop", "wide"],
  standard: ["mobile", "tablet", "laptop", "desktop", "wide"],
  extended: ALL_BREAKPOINTS.map(b => b.name),
};
const bpFilter = flags.breakpoints
  ? flags.breakpoints.split(",").map(s => s.trim())
  : flags.profile && PROFILES[flags.profile]
    ? PROFILES[flags.profile]
    : PROFILES.standard;
const BREAKPOINTS = ALL_BREAKPOINTS.filter(b => bpFilter.includes(b.name));
const CONTEXT_FACTOR = flags.context ? parseFloat(flags.context) : 0;

const SECTION_SELECTOR = flags["section-selector"] || "section";
const HIDE_LIST = flags.hide || null;
const EL_SELECTOR = flags.el || null;
const SCROLL_TO = flags["scroll-to"] ? parseInt(flags["scroll-to"], 10) : 0;
const LABEL = flags.label || null;
const NO_DEDUPE = !!flags["no-dedupe"];
const KEEP_SUBSETS = (flags.subsets || "latin,latin-ext").split(",").map(s => s.trim().toLowerCase());
const HEADED = !!flags["headed"];

const SCROLL_STEP = 600;
const ANIM_DELAY = 800;

// ── Shared helpers ──────────────────────────────────────────
function slugify(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9а-яёА-ЯЁ\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

function slugifySelector(sel) {
  return (sel || "el")
    .replace(/["']/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "el";
}

function download(url, filepath, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > 5) return reject(new Error("too many redirects"));
    const mod = url.startsWith("https") ? https : http;
    mod.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const nextUrl = new globalThis.URL(res.headers.location, url).href;
        return download(nextUrl, filepath, redirects + 1).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      const stream = fs.createWriteStream(filepath);
      res.pipe(stream);
      stream.on("finish", () => { stream.close(); resolve(); });
      stream.on("error", reject);
    }).on("error", reject);
  });
}

async function triggerAnimations(page) {
  const totalHeight = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < totalHeight; y += SCROLL_STEP) {
    await page.evaluate(pos => window.scrollTo(0, pos), y);
    await new Promise(r => setTimeout(r, ANIM_DELAY));
  }
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise(r => setTimeout(r, ANIM_DELAY));
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 300));
}

async function waitForPageReady(page, url) {
  const BLOCKED_PHRASES = ["access denied", "enable javascript", "checking your browser", "please wait", "cloudflare", "captcha", "just a moment"];
  const POLL_INTERVAL = 2000;
  const TIMEOUT = 5 * 60 * 1000; // 5 minutes max
  const started = Date.now();
  let dotCount = 0;

  while (true) {
    const bodyText = await page.evaluate(() => (document.body?.innerText || "").toLowerCase().slice(0, 500)).catch(() => "");
    const title = await page.evaluate(() => document.title.toLowerCase()).catch(() => "");
    const isBlocked = BLOCKED_PHRASES.some(p => bodyText.includes(p) || title.includes(p));
    const isEmpty = bodyText.trim().length < 50;

    if (!isBlocked && !isEmpty) break;

    if (Date.now() - started > TIMEOUT) {
      console.log("\n\x1b[31m[headed] Timed out waiting for page to become accessible.\x1b[0m");
      break;
    }

    if (dotCount === 0) {
      process.stdout.write("\x1b[33m[headed] Page blocked/loading — solve CAPTCHA in the browser window if needed");
    }
    process.stdout.write(".");
    dotCount++;
    await new Promise(r => setTimeout(r, POLL_INTERVAL));
  }

  if (dotCount > 0) console.log(" \x1b[32mOK\x1b[0m");
  // Let network settle after user interaction
  await page.waitForNetworkIdle({ idleTime: 1500, timeout: 15000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 800));
}

async function openPage(url, viewport = { width: 1920, height: 1080 }) {
  const browser = await puppeteer.launch({
    headless: HEADED ? false : "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
    defaultViewport: HEADED ? undefined : null,
  });
  const page = await browser.newPage();
  await page.setViewport({ ...viewport, deviceScaleFactor: 2 });
  await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
  if (HEADED) {
    console.log("\x1b[33m[headed] Browser opened — waiting for page to be accessible...\x1b[0m");
    await waitForPageReady(page, url);
  }
  await page.evaluate(() => document.fonts.ready);
  return { browser, page };
}

async function applyHides(page, hideList) {
  if (!hideList) return null;
  const css = `${hideList} { display: none !important; visibility: hidden !important; pointer-events: none !important; }`;
  return page.addStyleTag({ content: css });
}

async function removeHides(page, handle) {
  if (handle) await page.evaluate(node => node.remove(), handle);
}

// ── DOM-side utilities (injected via page.evaluate) ─────────
// Generates a reasonably-stable CSS selector for an element.
const CSS_SELECTOR_FN = `
  function cssSelector(el) {
    if (!el || el.nodeType !== 1) return null;
    if (el === document.body) return "body";
    if (el.id) return "#" + CSS.escape(el.id);
    const framerName = el.getAttribute && el.getAttribute("data-framer-name");
    if (framerName) return "[data-framer-name=" + JSON.stringify(framerName) + "]";
    const parts = [];
    let cur = el;
    while (cur && cur.tagName && cur !== document.body && parts.length < 5) {
      let sel = cur.tagName.toLowerCase();
      if (cur.id) { parts.unshift("#" + CSS.escape(cur.id)); break; }
      const fn = cur.getAttribute && cur.getAttribute("data-framer-name");
      if (fn) { parts.unshift("[data-framer-name=" + JSON.stringify(fn) + "]"); break; }
      const classList = cur.classList ? Array.from(cur.classList).filter(c => !/^framer-[a-z0-9]{4,}$/i.test(c) && !/^css-/.test(c)).slice(0, 2) : [];
      if (classList.length) sel += "." + classList.map(c => CSS.escape(c)).join(".");
      const parent = cur.parentElement;
      if (parent) {
        const sameTag = Array.from(parent.children).filter(c => c.tagName === cur.tagName);
        if (sameTag.length > 1) sel += ":nth-of-type(" + (sameTag.indexOf(cur) + 1) + ")";
      }
      parts.unshift(sel);
      cur = parent;
    }
    return parts.join(" > ");
  }
`;

// ── Command: inspect ────────────────────────────────────────
async function cmdInspect(url) {
  const { browser, page } = await openPage(url);
  await triggerAnimations(page);

  const info = await page.evaluate(`(() => {
    ${CSS_SELECTOR_FN}

    const result = {
      url: location.href,
      title: document.title,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      capturedAt: new Date().toISOString(),
      htmlLang: document.documentElement.lang || "",
      viewportMeta: document.querySelector("meta[name=viewport]")?.content || "",
      bodyBgColor: getComputedStyle(document.body).backgroundColor,
      fixedOrSticky: [],
      overlays: [],
      sections: [],
    };

    const COOKIE_KEYWORDS = ["cookie","consent","gdpr","accept","agree","принять","согласиться"];

    // Fixed / sticky elements
    const all = Array.from(document.querySelectorAll("*"));
    for (const el of all) {
      const cs = getComputedStyle(el);
      if (!(cs.position === "fixed" || cs.position === "sticky")) continue;
      const rect = el.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) continue;
      if (cs.display === "none" || cs.visibility === "hidden") continue;
      const textPreview = (el.innerText || "").trim().slice(0, 120).replace(/\\s+/g, " ");
      const role = (rect.top < 200 && rect.height < 200) ? "header-candidate" : (rect.bottom > window.innerHeight - 200 && rect.height < 200 ? "footer-candidate" : "floating");
      result.fixedOrSticky.push({
        selector: cssSelector(el),
        position: cs.position,
        zIndex: cs.zIndex,
        rect: { top: Math.round(rect.top), left: Math.round(rect.left), width: Math.round(rect.width), height: Math.round(rect.height) },
        tagName: el.tagName,
        role,
        textPreview,
        classes: typeof el.className === "string" ? el.className.slice(0, 120) : "",
        id: el.id || "",
      });
    }

    // Overlay candidates by keywords
    const seenOverlays = new Set();
    for (const el of all) {
      if (seenOverlays.has(el)) continue;
      const text = (el.innerText || "").toLowerCase();
      if (!text) continue;
      const matched = COOKIE_KEYWORDS.filter(k => text.includes(k));
      if (matched.length < 1) continue;
      // Require element to be somewhat overlay-like: has position fixed/sticky OR high z-index OR looks like a banner (wide + shortish)
      const cs = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      const looksOverlay = cs.position === "fixed" || cs.position === "sticky" || parseInt(cs.zIndex) >= 100 || (rect.width > window.innerWidth * 0.6 && rect.height < window.innerHeight * 0.5 && rect.height > 40);
      if (!looksOverlay) continue;
      // Skip if a parent is already recorded
      let p = el.parentElement;
      let parentRecorded = false;
      while (p) { if (seenOverlays.has(p)) { parentRecorded = true; break; } p = p.parentElement; }
      if (parentRecorded) continue;
      seenOverlays.add(el);
      result.overlays.push({
        selector: cssSelector(el),
        rect: { top: Math.round(rect.top), left: Math.round(rect.left), width: Math.round(rect.width), height: Math.round(rect.height) },
        textPreview: (el.innerText || "").trim().slice(0, 160).replace(/\\s+/g, " "),
        role: matched.includes("cookie") || matched.includes("consent") || matched.includes("gdpr") ? "cookie-banner-candidate" : "overlay-candidate",
        matchedKeywords: matched,
        tagName: el.tagName,
      });
    }

    // Sections
    const sections = Array.from(document.querySelectorAll("section"));
    sections.forEach((sec, i) => {
      const rect = sec.getBoundingClientRect();
      const heading = (sec.querySelector("h1,h2,h3,h4,h5,h6")?.innerText || "").trim();
      result.sections.push({
        index: i,
        selector: cssSelector(sec),
        heading,
        rect: { top: Math.round(rect.top + window.scrollY), width: Math.round(rect.width), height: Math.round(rect.height) },
        tagName: sec.tagName,
      });
    });

    return result;
  })()`);

  fs.writeFileSync(path.join(OUT_DIR, "_inspect.json"), JSON.stringify(info, null, 2));

  // Create _notes.md template (don't overwrite if exists)
  const notesPath = path.join(OUT_DIR, "_notes.md");
  if (!fs.existsSync(notesPath)) {
    const tmpl = `# Scrape notes — ${info.url}

Scraped at: ${info.capturedAt}
Title: ${info.title}
Sections found: ${info.sections.length}
Floating elements: ${info.fixedOrSticky.length}
Overlay candidates: ${info.overlays.length}

## Floating elements / overlays
<!-- After inspect: list which selectors are header/cookie/badge, what to hide for sections shots -->

## Hide list for sections
\`\`\`
<!-- comma-separated CSS selectors, paste into --hide= -->
\`\`\`

## Header structure
<!-- what's inside the header: logo, nav items, CTA; behaviour on mobile (hamburger?) -->

## Sections inventory
<!-- For each section: index, type (hero/features/testimonials/pricing/cta/footer), notable features (parallax, carousel, video) -->

## Assets roles
<!-- For each downloaded image: role (logo/icon/hero-bg/content/decorative) and where it's used -->

## Typography
<!-- Font families, usage (h1/h2/body), approximate sizes by breakpoint -->

## Colors
<!-- Hex codes sampled from screenshots -->

## Known issues / TODO for build
<!-- Animations invisible in static PNGs, hover states to re-capture later, responsive specifics -->
`;
    fs.writeFileSync(notesPath, tmpl);
  }

  console.log(JSON.stringify({
    url: info.url,
    title: info.title,
    sections: info.sections.length,
    fixedOrSticky: info.fixedOrSticky.length,
    overlays: info.overlays.length,
  }, null, 2));
  console.log(`\n_inspect.json → ${path.relative(process.cwd(), path.join(OUT_DIR, "_inspect.json"))}`);
  console.log(`_notes.md    → ${path.relative(process.cwd(), notesPath)}${fs.existsSync(notesPath) ? " (template)" : ""}`);

  await browser.close();
}

// ── Command: full ──────────────────────────────────────────
async function cmdFull(url) {
  const outDir = path.join(OUT_DIR, "full");
  fs.mkdirSync(outDir, { recursive: true });

  const { browser, page } = await openPage(url);
  for (const bp of BREAKPOINTS) {
    console.log(`📐 ${bp.name} (${bp.width}x${bp.height})`);
    await page.setViewport({ width: bp.width, height: bp.height, deviceScaleFactor: 2 });
    await new Promise(r => setTimeout(r, 800));
    const hideHandle = await applyHides(page, HIDE_LIST);
    await triggerAnimations(page);
    const fpath = path.join(outDir, `${bp.name}-${bp.width}x${bp.height}.png`);
    await page.screenshot({ path: fpath, fullPage: true });
    console.log(`  ✅ ${path.relative(process.cwd(), fpath)}`);
    await removeHides(page, hideHandle);
  }
  await browser.close();
}

// ── Command: element ───────────────────────────────────────
async function cmdElement(url) {
  if (!EL_SELECTOR) {
    console.error("element command requires --el=\"selector\"");
    process.exit(1);
  }
  const folder = LABEL || slugifySelector(EL_SELECTOR);
  const outDir = path.join(OUT_DIR, "element", folder);
  fs.mkdirSync(outDir, { recursive: true });

  const { browser, page } = await openPage(url);
  for (const bp of BREAKPOINTS) {
    console.log(`📐 ${bp.name} (${bp.width}x${bp.height}) — ${EL_SELECTOR}${SCROLL_TO ? ` @ scrollY=${SCROLL_TO}` : ""}`);
    await page.setViewport({ width: bp.width, height: bp.height, deviceScaleFactor: 2 });
    await new Promise(r => setTimeout(r, 800));
    const hideHandle = await applyHides(page, HIDE_LIST);
    await triggerAnimations(page);
    if (SCROLL_TO > 0) {
      await page.evaluate(y => window.scrollTo(0, y), SCROLL_TO);
      await new Promise(r => setTimeout(r, 500));
    }
    const el = await page.$(EL_SELECTOR);
    if (!el) {
      console.warn(`  ⚠ selector not found at ${bp.name}`);
      await removeHides(page, hideHandle);
      continue;
    }
    const suffix = CONTEXT_FACTOR > 0 ? `-ctx${CONTEXT_FACTOR}` : "";
    const fpath = path.join(outDir, `${bp.name}-${bp.width}x${bp.height}${suffix}.png`);
    try {
      if (CONTEXT_FACTOR > 0) {
        const clip = await computeContextClip(page, EL_SELECTOR, CONTEXT_FACTOR);
        if (clip) {
          await page.screenshot({ path: fpath, clip, captureBeyondViewport: true });
        } else {
          await el.screenshot({ path: fpath });
        }
      } else {
        await el.screenshot({ path: fpath });
      }
      console.log(`  ✅ ${path.relative(process.cwd(), fpath)}`);
    } catch (e) {
      console.warn(`  ⚠ ${bp.name} failed: ${e.message}`);
    }
    await removeHides(page, hideHandle);
  }
  await browser.close();
}

async function computeContextClip(page, selector, factor) {
  return await page.evaluate((sel, f) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const prev = el.previousElementSibling?.getBoundingClientRect();
    const next = el.nextElementSibling?.getBoundingClientRect();
    const padTop = prev ? Math.round(prev.height * f) : 0;
    const padBot = next ? Math.round(next.height * f) : 0;
    return {
      x: Math.max(0, Math.round(r.left + window.scrollX)),
      y: Math.max(0, Math.round(r.top + window.scrollY - padTop)),
      width: Math.round(r.width),
      height: Math.round(r.height + padTop + padBot),
    };
  }, selector, factor);
}

// ── Command: sections ──────────────────────────────────────
async function cmdSections(url) {
  const outDir = path.join(OUT_DIR, "sections");
  fs.mkdirSync(outDir, { recursive: true });

  const { browser, page } = await openPage(url);
  await triggerAnimations(page);

  // Collect section metadata once (at desktop)
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await new Promise(r => setTimeout(r, 500));

  const sectionsMeta = await page.evaluate(`(() => {
    ${CSS_SELECTOR_FN}
    const list = Array.from(document.querySelectorAll(${JSON.stringify(SECTION_SELECTOR)}));
    return list.map((sec, i) => {
      const rect = sec.getBoundingClientRect();
      const heading = (sec.querySelector("h1,h2,h3,h4,h5,h6")?.innerText || "").trim();
      return {
        index: i,
        selector: cssSelector(sec),
        heading,
        rect: { top: Math.round(rect.top + window.scrollY), width: Math.round(rect.width), height: Math.round(rect.height) },
      };
    });
  })()`);

  fs.writeFileSync(path.join(outDir, "_sections.json"), JSON.stringify(sectionsMeta, null, 2));
  console.log(`📋 ${sectionsMeta.length} sections → ${path.relative(process.cwd(), path.join(outDir, "_sections.json"))}`);

  for (const bp of BREAKPOINTS) {
    console.log(`\n📐 ${bp.name} (${bp.width}x${bp.height})`);
    await page.setViewport({ width: bp.width, height: bp.height, deviceScaleFactor: 2 });
    await new Promise(r => setTimeout(r, 800));
    const hideHandle = await applyHides(page, HIDE_LIST);
    await triggerAnimations(page);

    const handles = await page.$$(SECTION_SELECTOR);
    for (let i = 0; i < handles.length; i++) {
      const meta = sectionsMeta[i];
      const slug = slugify(meta?.heading || "");
      const folder = slug ? `section-${i}-${slug}` : `section-${i}`;
      const folderPath = path.join(outDir, folder);
      fs.mkdirSync(folderPath, { recursive: true });
      const suffix = CONTEXT_FACTOR > 0 ? `-ctx${CONTEXT_FACTOR}` : "";
      const fpath = path.join(folderPath, `${bp.name}-${bp.width}x${bp.height}${suffix}.png`);
      try {
        if (CONTEXT_FACTOR > 0) {
          const clip = await page.evaluate((idx, sel, f) => {
            const nodes = document.querySelectorAll(sel);
            const el = nodes[idx];
            if (!el) return null;
            const r = el.getBoundingClientRect();
            const prev = el.previousElementSibling?.getBoundingClientRect();
            const next = el.nextElementSibling?.getBoundingClientRect();
            const padTop = prev ? Math.round(prev.height * f) : 0;
            const padBot = next ? Math.round(next.height * f) : 0;
            return {
              x: Math.max(0, Math.round(r.left + window.scrollX)),
              y: Math.max(0, Math.round(r.top + window.scrollY - padTop)),
              width: Math.round(r.width),
              height: Math.round(r.height + padTop + padBot),
            };
          }, i, SECTION_SELECTOR, CONTEXT_FACTOR);
          if (clip) {
            await page.screenshot({ path: fpath, clip, captureBeyondViewport: true });
          } else {
            await handles[i].screenshot({ path: fpath });
          }
        } else {
          await handles[i].screenshot({ path: fpath });
        }
      } catch (e) {
        console.warn(`  ⚠ section-${i} skipped: ${e.message}`);
      }
    }
    console.log(`  ✅ ${handles.length} sections`);
    await removeHides(page, hideHandle);
  }

  await browser.close();
}

// ── Command: images ────────────────────────────────────────
async function cmdImages(url) {
  const outDir = path.join(OUT_DIR, "images");
  fs.mkdirSync(outDir, { recursive: true });

  const { browser, page } = await openPage(url);
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });
  await triggerAnimations(page);

  const data = await page.evaluate((sectionSelector) => {
    const topSections = Array.from(document.querySelectorAll(sectionSelector));
    const sectionIndex = new Map(topSections.map((s, i) => [s, i]));
    const sectionInfo = topSections.map((sec, i) => ({
      index: i,
      heading: (sec.querySelector("h1,h2,h3,h4,h5,h6")?.innerText || "").trim(),
    }));

    function findSection(el) {
      const sec = el.closest(sectionSelector);
      return sec && sectionIndex.has(sec) ? sectionIndex.get(sec) : -1;
    }

    const result = [];
    const seen = new Set();
    function add(url, meta) {
      if (!url || !url.startsWith("http") || seen.has(url)) return;
      seen.add(url);
      result.push({ url, ...meta });
    }

    document.querySelectorAll("img").forEach(img => {
      const meta = {
        alt: img.alt || "",
        title: img.title || "",
        ariaLabel: img.getAttribute("aria-label") || "",
        className: typeof img.className === "string" ? img.className : "",
        id: img.id || "",
        sectionIdx: findSection(img),
      };
      if (img.src) add(img.src, meta);
      if (img.srcset) img.srcset.split(",").forEach(s => add(s.trim().split(/\s+/)[0], meta));
    });
    document.querySelectorAll("source").forEach(s => {
      const parent = s.closest("picture");
      const img = parent?.querySelector("img");
      const meta = {
        alt: img?.alt || "",
        title: img?.title || "",
        ariaLabel: "",
        className: "", id: "",
        sectionIdx: findSection(s),
      };
      if (s.srcset) s.srcset.split(",").forEach(part => add(part.trim().split(/\s+/)[0], meta));
    });
    document.querySelectorAll("*").forEach(el => {
      const bg = getComputedStyle(el).backgroundImage;
      if (bg && bg !== "none") {
        const matches = bg.matchAll(/url\(["']?(.+?)["']?\)/g);
        const sectionIdx = findSection(el);
        for (const m of matches) {
          add(m[1], {
            alt: "", title: "",
            ariaLabel: el.getAttribute("aria-label") || "",
            className: typeof el.className === "string" ? el.className : "",
            id: el.id || "",
            sectionIdx,
          });
        }
      }
    });
    document.querySelectorAll("video[poster]").forEach(v => {
      add(v.poster, {
        alt: "", title: "",
        ariaLabel: v.getAttribute("aria-label") || "",
        className: "", id: "",
        sectionIdx: findSection(v),
      });
    });

    return { sections: sectionInfo, images: result };
  }, SECTION_SELECTOR);

  const sectionFolders = data.sections.map(s => {
    const slug = slugify(s.heading);
    return slug ? `section-${s.index}-${slug}` : `section-${s.index}`;
  });

  // Dedupe: group by pathname (strip query), keep the biggest variant
  const beforeDedupe = data.images.length;
  if (!NO_DEDUPE) {
    const byPath = new Map();
    for (const img of data.images) {
      let pathname;
      try { pathname = new globalThis.URL(img.url).pathname; } catch { pathname = img.url; }
      const existing = byPath.get(pathname);
      if (!existing) { byPath.set(pathname, img); continue; }
      const existingHasQuery = existing.url.includes("?");
      const newHasQuery = img.url.includes("?");
      if (existingHasQuery && !newHasQuery) {
        byPath.set(pathname, img);
      } else if (existingHasQuery && newHasQuery) {
        const eSize = parseInt((existing.url.match(/scale-down-to=(\d+)/) || [0,0])[1]) || 0;
        const nSize = parseInt((img.url.match(/scale-down-to=(\d+)/) || [0,0])[1]) || 0;
        if (nSize > eSize) byPath.set(pathname, img);
      }
    }
    data.images = Array.from(byPath.values());
    console.log(`🧹 dedupe: ${beforeDedupe} → ${data.images.length} (removed ${beforeDedupe - data.images.length} size-variants)`);
  }

  const downloaded = [];
  const usedNames = new Map();
  let ok = 0, fail = 0;
  for (let i = 0; i < data.images.length; i++) {
    const img = data.images[i];
    try {
      const parsed = new globalThis.URL(img.url);
      let ext = path.extname(parsed.pathname).split("?")[0] || ".png";
      if (ext.length > 6) ext = ".png";
      const folder = img.sectionIdx >= 0 ? sectionFolders[img.sectionIdx] : "other";
      const folderPath = path.join(outDir, folder);
      fs.mkdirSync(folderPath, { recursive: true });

      const rawName = img.alt || img.title || img.ariaLabel || img.id || img.className || "";
      let name = slugify(rawName);
      if (!name) name = slugify(path.basename(parsed.pathname, ext)) || `image-${i}`;

      if (!usedNames.has(folder)) usedNames.set(folder, new Set());
      const used = usedNames.get(folder);
      let finalName = name;
      let counter = 1;
      while (used.has(finalName)) finalName = `${name}-${counter++}`;
      used.add(finalName);

      const filename = `${finalName}${ext}`;
      await download(img.url, path.join(folderPath, filename));
      downloaded.push({
        folder, filename,
        url: img.url,
        alt: img.alt, title: img.title, ariaLabel: img.ariaLabel,
        sectionIdx: img.sectionIdx,
        role: null,   // Claude fills manually
        usage: null,  // Claude fills manually
      });
      ok++;
    } catch (e) {
      fail++;
      console.log(`  ❌ ${img.url} — ${e.message}`);
    }
  }

  fs.writeFileSync(
    path.join(outDir, "_manifest.json"),
    JSON.stringify({ sections: data.sections, images: downloaded }, null, 2)
  );
  console.log(`✅ images: ${ok} saved, ${fail} failed → ${path.relative(process.cwd(), outDir)}`);

  await browser.close();
}

// ── Command: fonts ─────────────────────────────────────────
async function cmdFonts(url) {
  const outDir = path.join(OUT_DIR, "fonts");
  fs.mkdirSync(outDir, { recursive: true });

  const { browser, page } = await openPage(url);

  const fontFaces = await page.evaluate(() => {
    const faces = [];
    for (const sheet of document.styleSheets) {
      let rules;
      try { rules = sheet.cssRules || sheet.rules; } catch { continue; }
      if (!rules) continue;
      for (const rule of rules) {
        if (rule.type === CSSRule.FONT_FACE_RULE || rule.constructor.name === "CSSFontFaceRule") {
          const family = (rule.style.fontFamily || "").replace(/["']/g, "").trim();
          const weight = rule.style.fontWeight || "normal";
          const style = rule.style.fontStyle || "normal";
          const src = rule.style.src || "";
          const unicodeRange = (rule.style.unicodeRange || rule.style.getPropertyValue("unicode-range") || "").trim();
          const urls = [];
          const matches = src.matchAll(/url\(["']?([^"')]+)["']?\)(?:\s+format\(["']?([^"')]+)["']?\))?/g);
          for (const m of matches) urls.push({ url: m[1], format: m[2] || null });
          faces.push({ family, weight, style, unicodeRange, urls });
        }
      }
    }
    return faces;
  });

  // Classify subset by unicode-range (parse numeric intervals, check overlap with known ranges)
  function parseRanges(str) {
    if (!str) return [];
    const out = [];
    for (const p of str.replace(/\s+/g, "").split(",")) {
      const m = p.match(/^u\+([0-9a-f]+)(?:-([0-9a-f]+))?$/i);
      if (!m) continue;
      const from = parseInt(m[1], 16);
      const to = m[2] ? parseInt(m[2], 16) : from;
      out.push({ from, to });
    }
    return out;
  }
  function overlaps(ranges, from, to) {
    return ranges.some(r => r.from <= to && r.to >= from);
  }
  function classifySubset(range) {
    if (!range) return "unknown";
    const rs = parseRanges(range);
    if (!rs.length) return "unknown";
    // Latin first: basic ASCII range (U+0020–U+007E) is a reliable marker even with stray codepoints.
    if (overlaps(rs, 0x0020, 0x007E)) return "latin";
    // Latin-ext-exclusive markers (these codepoints are in latin-ext but NOT vietnamese).
    if (overlaps(rs, 0xA720, 0xA7FF) || overlaps(rs, 0x2C60, 0x2C7F) || overlaps(rs, 0x0259, 0x0259)) return "latin-ext";
    // Cyrillic-ext (before cyrillic — narrower marker codepoints)
    if (overlaps(rs, 0x0460, 0x052F) || overlaps(rs, 0x1C80, 0x1C88) || overlaps(rs, 0x2DE0, 0x2DFF) || overlaps(rs, 0xA640, 0xA69F)) return "cyrillic-ext";
    if (overlaps(rs, 0x0400, 0x045F)) return "cyrillic";
    if (overlaps(rs, 0x1F00, 0x1FFF)) return "greek-ext";
    if (overlaps(rs, 0x0370, 0x03FF)) return "greek";
    if (overlaps(rs, 0x1EA0, 0x1EF9)) return "vietnamese";
    if (overlaps(rs, 0x0100, 0x024F) || overlaps(rs, 0x1E00, 0x1EFF)) return "latin-ext";
    return "other";
  }

  const before = fontFaces.length;
  const keepAll = KEEP_SUBSETS.includes("all");
  const explicitSubsets = !!flags.subsets;
  const DROP_NON_LATIN = ["cyrillic", "cyrillic-ext", "vietnamese", "greek", "greek-ext"];
  const filtered = fontFaces.map(f => ({ ...f, subset: classifySubset(f.unicodeRange) }))
    .filter(f => {
      if (keepAll) return true;
      if (explicitSubsets) return KEEP_SUBSETS.includes(f.subset);
      // Default: drop known non-latin subsets, keep everything else (latin, latin-ext, unknown, other)
      return !DROP_NON_LATIN.includes(f.subset);
    });
  const droppedSubsetCounts = {};
  for (const f of fontFaces) {
    const s = classifySubset(f.unicodeRange);
    if (keepAll) continue;
    const dropped = explicitSubsets ? !KEEP_SUBSETS.includes(s) : DROP_NON_LATIN.includes(s);
    if (dropped) droppedSubsetCounts[s] = (droppedSubsetCounts[s] || 0) + 1;
  }
  const mode = keepAll ? "all" : (explicitSubsets ? `keep=${KEEP_SUBSETS.join(",")}` : `drop=${DROP_NON_LATIN.join(",")}`);
  console.log(`🧹 subset filter: ${before} → ${filtered.length} kept (${mode})`);
  if (Object.keys(droppedSubsetCounts).length) {
    console.log(`   dropped: ${Object.entries(droppedSubsetCounts).map(([s,n]) => `${s}×${n}`).join(", ")}`);
  }

  const fontManifest = [];
  const seen = new Set();
  let ok = 0, fail = 0;
  for (let i = 0; i < filtered.length; i++) {
    const face = filtered[i];
    for (const u of face.urls) {
      let absUrl;
      try { absUrl = new globalThis.URL(u.url, urlArg).href; } catch { continue; }
      if (seen.has(absUrl)) continue;
      seen.add(absUrl);

      const parsed = new globalThis.URL(absUrl);
      let ext = path.extname(parsed.pathname).split("?")[0];
      if (!ext || ext.length > 6) ext = u.format ? `.${u.format}` : ".woff2";

      const base = slugify(`${face.family}-${face.weight}-${face.style}`) || `font-${i}`;
      let filename = `${base}${ext}`;
      let counter = 1;
      while (fs.existsSync(path.join(outDir, filename))) {
        filename = `${base}-${counter++}${ext}`;
      }

      try {
        await download(absUrl, path.join(outDir, filename));
        fontManifest.push({
          family: face.family,
          weight: face.weight,
          style: face.style,
          subset: face.subset,
          format: u.format,
          url: absUrl,
          localPath: `fonts/${filename}`,
          usage: null,  // Claude fills manually
        });
        ok++;
      } catch (e) {
        fail++;
        console.log(`  ❌ ${absUrl} — ${e.message}`);
      }
    }
  }

  fs.writeFileSync(path.join(outDir, "_fonts.json"), JSON.stringify(fontManifest, null, 2));
  console.log(`✅ fonts: ${ok} saved, ${fail} failed → ${path.relative(process.cwd(), outDir)}`);

  await browser.close();
}

// ── Dispatch ───────────────────────────────────────────────
const handlers = {
  inspect: cmdInspect,
  full: cmdFull,
  element: cmdElement,
  sections: cmdSections,
  images: cmdImages,
  fonts: cmdFonts,
};

handlers[command](urlArg).catch(err => {
  console.error(`\n${command} failed:`, err);
  process.exit(1);
});
