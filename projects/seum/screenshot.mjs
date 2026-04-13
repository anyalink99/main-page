/**
 * screenshot.mjs — Puppeteer screenshot utility for Linux
 *
 * Usage:
 *   node screenshot.mjs <url> [label] [flags]
 *
 * Breakpoint profiles (pair with --multi-device):
 *   --profile=core       → mobile, desktop, wide              (3 shots, default for checkups)
 *   --profile=standard   → mobile, tablet, laptop, desktop, wide   (5 shots)
 *   --profile=extended   → all 12 (xs … ultra)                (use only when truly needed)
 *   Without --profile, --multi-device falls back to `core`.
 *
 * Modes:
 *   Full page:              node screenshot.mjs http://localhost:3000 hero
 *   Sections:               node screenshot.mjs http://localhost:3000 --sections
 *   Element:                node screenshot.mjs http://localhost:3000 --el=".hero"
 *   Element with context:   node screenshot.mjs http://localhost:3000 --el=".hero" --context=0.5
 *                           (adds 0.5× height of previous sibling above and 0.5× of next sibling below,
 *                            so the block is visible in the rhythm of its neighbours)
 *   Custom viewport:        node screenshot.mjs http://localhost:3000 --vw=1920x1080
 *   Wait for net-idle:      node screenshot.mjs http://localhost:3000 --wait=3000
 *   One device:             node screenshot.mjs http://localhost:3000 --device=mobile
 *   Multi-device (profile): node screenshot.mjs http://localhost:3000 hero --multi-device --profile=standard
 *
 * Output → ./temporary screenshots/screenshot-N[-label][-device].png
 * Auto-incrementing counter, never overwrites.
 */

import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

// ── Parse args ──────────────────────────────────────────────
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: node screenshot.mjs <url> [label] [flags]");
  console.error("Flags: --sections  --el=\"selector\"  --vw=WxH  --wait=ms  --device=<name>  --multi-device  --profile=core|standard|extended");
  process.exit(1);
}

const url = args[0];
let label = null;
let sectionsMode = false;
let elSelector = null;
let viewportStr = null;
let waitMs = 0;
let device = null;
let multiDevice = false;
let profile = null;
let contextFactor = 0;

for (let i = 1; i < args.length; i++) {
  const a = args[i];
  if (a === "--sections") { sectionsMode = true; continue; }
  if (a === "--multi-device") { multiDevice = true; continue; }
  if (a.startsWith("--el=")) { elSelector = a.slice(5); continue; }
  if (a.startsWith("--vw=")) { viewportStr = a.slice(5); continue; }
  if (a.startsWith("--wait=")) { waitMs = parseInt(a.slice(7), 10); continue; }
  if (a.startsWith("--device=")) { device = a.slice(9); continue; }
  if (a.startsWith("--profile=")) { profile = a.slice(10); continue; }
  if (a.startsWith("--context=")) { contextFactor = parseFloat(a.slice(10)); continue; }
  if (!a.startsWith("--")) { label = a; }
}

// ── Viewport / device presets ───────────────────────────────
const DEVICES = {
  xs:       { width: 360,  height: 780 },
  mobile:   { width: 375,  height: 812 },
  "mobile-l": { width: 430, height: 932 },
  sm:       { width: 640,  height: 900 },
  tablet:   { width: 768,  height: 1024 },
  md:       { width: 900,  height: 1200 },
  laptop:   { width: 1024, height: 768 },
  maxw:     { width: 1280, height: 900 },
  desktop:  { width: 1440, height: 900 },
  xl:       { width: 1680, height: 1050 },
  wide:     { width: 1920, height: 1080 },
  ultra:    { width: 2560, height: 1440 },
};

// Breakpoint profiles — pick a subset of DEVICES to iterate in --multi-device mode.
const PROFILES = {
  core:     ["mobile", "desktop", "wide"],
  standard: ["mobile", "tablet", "laptop", "desktop", "wide"],
  extended: Object.keys(DEVICES),
};
const activeProfile = (multiDevice && (PROFILES[profile] || PROFILES.core)) || null;

let vw = 1440, vh = 900;
if (device && DEVICES[device]) {
  vw = DEVICES[device].width;
  vh = DEVICES[device].height;
}
if (viewportStr) {
  const [w, h] = viewportStr.split("x").map(Number);
  if (w && h) { vw = w; vh = h; }
}

// ── Output directory & auto-increment counter ───────────────
const OUT_DIR = path.join(process.cwd(), "temporary screenshots");
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

function nextIndex() {
  const files = fs.readdirSync(OUT_DIR).filter(f => f.startsWith("screenshot-"));
  let max = 0;
  for (const f of files) {
    const m = f.match(/^screenshot-(\d+)/);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return max + 1;
}

function buildFilename(idx, suffix) {
  const parts = ["screenshot", String(idx)];
  if (suffix) parts.push(suffix);
  return parts.join("-") + ".png";
}

// ── Main ────────────────────────────────────────────────────
async function captureAt(page, deviceName, width, height, saved) {
  await page.setViewport({ width, height, deviceScaleFactor: 2 });
  await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });

  if (waitMs > 0) await new Promise(r => setTimeout(r, waitMs));
  await page.evaluate(() => document.fonts.ready);

  const suffix = (base) => {
    if (!deviceName) return base;
    return base ? `${base}-${deviceName}` : deviceName;
  };

  if (sectionsMode) {
    const sectionHandles = await page.$$("section, [data-section]");
    if (sectionHandles.length === 0) {
      console.warn("No <section> or [data-section] elements found. Taking full page instead.");
      const idx = nextIndex();
      const fname = buildFilename(idx, suffix(label));
      const fpath = path.join(OUT_DIR, fname);
      await page.screenshot({ path: fpath, fullPage: true });
      saved.push(fpath);
    } else {
      for (let i = 0; i < sectionHandles.length; i++) {
        const idx = nextIndex();
        const base = label ? `${label}-section-${i}` : `section-${i}`;
        const fname = buildFilename(idx, suffix(base));
        const fpath = path.join(OUT_DIR, fname);
        await sectionHandles[i].screenshot({ path: fpath });
        saved.push(fpath);
      }
    }
  } else if (elSelector) {
    const el = await page.$(elSelector);
    if (!el) {
      console.error(`Selector "${elSelector}" not found on page.`);
      return { notFound: true };
    }
    const idx = nextIndex();
    const base = label || elSelector.replace(/[^a-zA-Z0-9-]/g, "_");
    const fname = buildFilename(idx, suffix(base));
    const fpath = path.join(OUT_DIR, fname);
    if (contextFactor > 0) {
      const clip = await page.evaluate((sel, f) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        const pageTop = r.top + window.scrollY;
        const pageLeft = r.left + window.scrollX;
        const prev = el.previousElementSibling?.getBoundingClientRect();
        const next = el.nextElementSibling?.getBoundingClientRect();
        const padTop = prev ? Math.round(prev.height * f) : 0;
        const padBot = next ? Math.round(next.height * f) : 0;
        return {
          x: Math.max(0, Math.round(pageLeft)),
          y: Math.max(0, Math.round(pageTop - padTop)),
          width: Math.round(r.width),
          height: Math.round(r.height + padTop + padBot),
        };
      }, elSelector, contextFactor);
      if (clip) {
        await page.screenshot({ path: fpath, clip, captureBeyondViewport: true });
      } else {
        await el.screenshot({ path: fpath });
      }
    } else {
      await el.screenshot({ path: fpath });
    }
    saved.push(fpath);
  } else {
    const idx = nextIndex();
    const fname = buildFilename(idx, suffix(label));
    const fpath = path.join(OUT_DIR, fname);
    await page.screenshot({ path: fpath, fullPage: true });
    saved.push(fpath);
  }
  return {};
}

async function run() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });

  const page = await browser.newPage();
  const saved = [];

  if (multiDevice) {
    for (const name of activeProfile) {
      const dims = DEVICES[name];
      const result = await captureAt(page, name, dims.width, dims.height, saved);
      if (result.notFound) {
        await browser.close();
        process.exit(1);
      }
    }
  } else {
    const result = await captureAt(page, null, vw, vh, saved);
    if (result.notFound) {
      await browser.close();
      process.exit(1);
    }
  }

  await browser.close();
  for (const s of saved) console.log(`Saved: ${s}`);
}

run().catch(err => {
  console.error("Screenshot failed:", err.message);
  process.exit(1);
});
