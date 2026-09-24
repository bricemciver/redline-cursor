import { test } from "node:test";
import assert from "node:assert/strict";
import { modelFamily, parseModelList, pickReviewModel } from "./models.mjs";

test("modelFamily groups ids and display names by vendor", () => {
  assert.equal(modelFamily("claude-opus-5-thinking-high"), "claude");
  assert.equal(modelFamily("Claude Opus 5 1M Thinking"), "claude");
  assert.equal(modelFamily("cursor-grok-4.6-high"), "grok");
  assert.equal(modelFamily("gpt-5.3-codex"), "gpt");
});

test("parseModelList extracts ids from `agent models` output", () => {
  const output = [
    "Available models",
    "",
    "auto - Auto (default)",
    "gpt-5.6-sol-high - GPT-5.6 Sol 1M High",
    "claude-opus-5-thinking-high - Claude Opus 5 1M Thinking",
  ].join("\n");
  assert.deepEqual(parseModelList(output), [
    "auto",
    "gpt-5.6-sol-high",
    "claude-opus-5-thinking-high",
  ]);
});

const available = [
  "gpt-5.6-sol-high",
  "claude-opus-5-thinking-high",
  "cursor-grok-4.6-high",
];

test("uses the preferred model when it differs from the current one", () => {
  assert.equal(
    pickReviewModel({ preferred: "gpt-5.6-sol-high", current: "claude-opus-5-thinking-high", available }),
    "gpt-5.6-sol-high",
  );
});

test("falls back to another family when the preferred model matches the current one", () => {
  assert.equal(
    pickReviewModel({ preferred: "claude-opus-5-thinking-high", current: "Claude Opus 5 1M Thinking", available }),
    "gpt-5.6-sol-high",
  );
});

test("skips candidates the account cannot use", () => {
  assert.equal(
    pickReviewModel({ preferred: "not-a-model", current: "gpt-5.2", available }),
    "claude-opus-5-thinking-high",
  );
});

test("uses the preferred model when the current model is unknown", () => {
  assert.equal(
    pickReviewModel({ preferred: "cursor-grok-4.6-high", current: undefined, available }),
    "cursor-grok-4.6-high",
  );
});

test("returns null when no different-family model is available", () => {
  assert.equal(
    pickReviewModel({ preferred: undefined, current: "gpt-5.2", available: ["gpt-5.6-sol-high"] }),
    null,
  );
});
