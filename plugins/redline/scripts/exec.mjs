#!/usr/bin/env node
/**
 * Runs a read-only Cursor agent (`cursor-agent -p --mode ask`) as a reviewer.
 *
 * Usage:
 *   exec.mjs review [--current-model <model>] <diff-flag>
 *   exec.mjs rescue [--current-model <model>] <task>
 *
 * Diff flags: --uncommitted | --base <ref> | --commit <sha>
 *
 * The review model is the one saved by the redline-setup skill, or a fallback
 * when that model is unavailable or shares a family with --current-model.
 */

import { spawn } from "node:child_process";
import { loadConfig } from "./lib/config.mjs";
import { listAvailableModels, pickReviewModel } from "./lib/models.mjs";

const REVIEW_INSTRUCTIONS =
  "You are a code reviewer giving a second opinion. Inspect the code yourself with git and file reads. " +
  "Report bugs, security issues, and risky changes as a prioritized list with severity and file:line references. " +
  "Do not modify any files.";

function usage(message) {
  console.error(message);
  console.error("Usage: exec.mjs <review|rescue> [--current-model <model>] [args...]");
  process.exit(2);
}

function extractCurrentModel(args) {
  const i = args.indexOf("--current-model");
  if (i < 0) return { current: undefined, rest: args };
  return { current: args[i + 1], rest: [...args.slice(0, i), ...args.slice(i + 2)] };
}

function describeTarget([flag, value]) {
  if (!flag || flag === "--uncommitted") {
    return "the uncommitted changes (staged, unstaged, and untracked; see `git status` and `git diff HEAD`)";
  }
  if (flag !== "--base" && flag !== "--commit") usage(`Unknown diff flag "${flag}"`);
  if (!value) usage(`${flag} requires a value`);
  if (flag === "--base") return `the changes relative to ${value} (\`git diff ${value}...HEAD\`)`;
  return `commit ${value} (\`git show ${value}\`)`;
}

function buildPrompt(mode, args) {
  if (mode === "review") return `${REVIEW_INSTRUCTIONS}\n\nReview ${describeTarget(args)}.`;
  if (args.length === 0) usage("exec.mjs rescue: missing task argument");
  return `A teammate is stuck and wants your help. Investigate the codebase and advise; do not modify any files.\n\n${args.join(" ")}`;
}

function main() {
  const [mode, ...args] = process.argv.slice(2);
  if (mode !== "review" && mode !== "rescue") usage(`Unknown mode "${mode}"`);

  const { current, rest } = extractCurrentModel(args);
  const prompt = buildPrompt(mode, rest);

  let available;
  try {
    available = listAvailableModels();
  } catch {
    console.error("Error: could not list Cursor models. Run `cursor-agent login` (or /redline-setup) first.");
    process.exit(3);
  }
  const model = pickReviewModel({ preferred: loadConfig().model, current, available });
  if (!model) {
    console.error(`Error: no available review model differs from the current model (${current}). Run /redline-setup.`);
    process.exit(3);
  }
  console.error(`redline: reviewing with ${model}`);

  const child = spawn(
    "cursor-agent",
    ["-p", "--mode", "ask", "--trust", "--model", model, prompt],
    { stdio: "inherit" },
  );
  child.on("error", (err) => {
    console.error(`Failed to spawn cursor-agent: ${err.message}`);
    process.exit(127);
  });
  child.on("exit", (code, signal) => {
    if (signal) process.kill(process.pid, signal);
    else process.exit(code ?? 1);
  });
}

main();
