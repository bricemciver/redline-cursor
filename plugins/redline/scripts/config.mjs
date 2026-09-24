#!/usr/bin/env node
/**
 * CLI wrapper around lib/config.mjs for use from the redline-setup skill.
 *
 * Usage:
 *   config.mjs set key=value [key=value ...]
 *   config.mjs get [key ...]
 *   config.mjs show            # raw config.json contents
 */

import { loadConfig, saveConfig } from "./lib/config.mjs";

const ALLOWED_KEYS = new Set(["model"]);

function parsePairs(pairs) {
  const out = {};
  for (const pair of pairs) {
    const eq = pair.indexOf("=");
    if (eq < 0) {
      console.error(`Invalid argument "${pair}" (expected key=value).`);
      process.exit(2);
    }
    const key = pair.slice(0, eq);
    const value = pair.slice(eq + 1);
    if (!ALLOWED_KEYS.has(key)) {
      console.error(
        `Unknown key "${key}". Allowed: ${[...ALLOWED_KEYS].join(", ")}`,
      );
      process.exit(2);
    }
    out[key] = value;
  }
  return out;
}

const [cmd, ...rest] = process.argv.slice(2);

if (cmd === "set") {
  const updates = parsePairs(rest);
  const config = { ...loadConfig(), ...updates };
  saveConfig(config);
  const keys = Object.keys(updates).join(", ");
  console.log(`Saved: ${keys}`);
} else if (cmd === "get") {
  const stored = loadConfig();
  const keys = rest.length === 0 ? [...ALLOWED_KEYS] : rest;
  for (const key of keys) {
    const value = stored[key] || "";
    console.log(rest.length === 0 ? `${key}=${value}` : value);
  }
} else if (cmd === "show") {
  console.log(JSON.stringify(loadConfig(), null, 2));
} else {
  console.error("Usage: config.mjs <set|get|show> [...]");
  process.exit(2);
}
