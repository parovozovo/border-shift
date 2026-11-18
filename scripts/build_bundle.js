#!/usr/bin/env node
/**
 * Bundle & Android Assets Sync Script for Border Shift: Kraina.
 *
 * Reads modular JS files from docs/src/{data,audio,world,render,engine}/,
 * sorts them numerically by filename prefix (01_..10_), wraps them in an IIFE
 * into docs/game.js, checks JS syntax, and mirrors web assets into
 * app/src/main/assets/ for the Android WebView build.
 */
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT_DIR = path.resolve(__dirname, "..");
const DOCS_DIR = path.join(ROOT_DIR, "docs");
const SRC_DIR = path.join(DOCS_DIR, "src");
const ASSETS_DIR = path.join(ROOT_DIR, "app", "src", "main", "assets");

const MODULE_GROUPS = ["data", "audio", "world", "render", "engine"];
const WEB_ASSET_FILES = ["index.html", "styles.css", "game.js", "manifest.json"];

function collectModuleFiles() {
  if (!fs.existsSync(SRC_DIR)) {
    throw new Error(`Modular source directory not found: ${SRC_DIR}`);
  }
  const files = [];
  for (const group of MODULE_GROUPS) {
    const groupDir = path.join(SRC_DIR, group);
    if (!fs.existsSync(groupDir)) continue;
    for (const entry of fs.readdirSync(groupDir)) {
      if (entry.endsWith(".js")) {
        files.push({
          group,
          name: entry,
          fullPath: path.join(groupDir, entry)
        });
      }
    }
  }
  files.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  if (files.length === 0) {
    throw new Error(`No .js module files found under ${SRC_DIR}`);
  }
  return files;
}

function buildGameBundle() {
  const modules = collectModuleFiles();
  const parts = modules.map((mod) => {
    const raw = fs.readFileSync(mod.fullPath, "utf8").replace(/\r\n/g, "\n");
    return raw.replace(/^\n+|\n+$/g, "");
  });

  const bundled = [
    "(() => {",
    '  "use strict";',
    "",
    parts.join("\n\n"),
    "})();",
    ""
  ].join("\n");

  // Validate syntax before writing
  new vm.Script(bundled, { filename: "docs/game.js" });

  const outPath = path.join(DOCS_DIR, "game.js");
  fs.writeFileSync(outPath, bundled, "utf8");
  console.log(
    `[build_bundle] Built ${path.relative(ROOT_DIR, outPath)} from ${modules.length} modules (${bundled.split("\n").length} lines).`
  );
}

function syncAndroidAssets() {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
  for (const file of WEB_ASSET_FILES) {
    const src = path.join(DOCS_DIR, file);
    if (!fs.existsSync(src)) {
      throw new Error(`Missing docs asset required for Android APK: ${src}`);
    }
    const dst = path.join(ASSETS_DIR, file);
    fs.copyFileSync(src, dst);
  }
  console.log(
    `[build_bundle] Synced ${WEB_ASSET_FILES.join(", ")} -> ${path.relative(ROOT_DIR, ASSETS_DIR)}`
  );
}

buildGameBundle();
syncAndroidAssets();
