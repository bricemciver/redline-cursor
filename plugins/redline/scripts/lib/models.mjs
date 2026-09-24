/**
 * Review-model selection. A review is only a second opinion if it comes from
 * a different model family than the one that wrote the code.
 */

import { execFileSync } from "node:child_process";

export const FALLBACK_MODELS = [
  "gpt-5.6-sol-high",
  "claude-opus-5-thinking-high",
  "cursor-grok-4.6-high",
];

/** Accepts ids ("claude-opus-5-thinking-high") or display names ("Claude Opus 5"). */
export function modelFamily(model) {
  return model.toLowerCase().replace(/^cursor-/, "").split(/[-\s]/)[0];
}

export function parseModelList(output) {
  return output
    .split("\n")
    .map((line) => line.match(/^(\S+) - /)?.[1])
    .filter(Boolean);
}

export function listAvailableModels() {
  return parseModelList(
    execFileSync("cursor-agent", ["models"], { encoding: "utf-8" }),
  );
}

export function pickReviewModel({ preferred, current, available }) {
  const currentFamily = current ? modelFamily(current) : null;
  const candidates = [preferred, ...FALLBACK_MODELS].filter(Boolean);
  return (
    candidates.find(
      (model) =>
        available.includes(model) && modelFamily(model) !== currentFamily,
    ) ?? null
  );
}
