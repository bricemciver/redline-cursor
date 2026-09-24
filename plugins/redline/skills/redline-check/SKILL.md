---
name: redline-check
description: Decide whether to run a background redline review after making code changes. Use when the redline stop hook prompts you to consider a review.
---

When the redline stop hook prompts you to consider a review, pick one of these skills, then read and follow its `SKILL.md` (a sibling directory of this skill). Each skill shells out to a read-only `cursor-agent` running a different model, as a background shell command, so your main session stays responsive -- do **not** delegate it to a subagent.

Default to `redline-review`. Only deviate when one of the specific signals below is clearly present:

- **`redline-review`** -- standard code review. Use this whenever you shipped a concrete code change and none of the signals below apply.
- **`redline-adversarial`** -- use when you were deliberating architecture, design, or a non-obvious trade-off this turn and want the design pressure-tested. Signals: you chose between multiple approaches, picked a new abstraction, introduced a contract/interface, or made a change whose *correctness hinges on the design being right* rather than on the code being clean.
- **`redline-rescue`** -- use when you were going in circles, repeatedly failing at the same task, or stuck on something you couldn't solve yourself and need third-party advice. Signals: repeated failed attempts, the user had to redirect you, you explicitly asked the user for help, or you hit a problem whose root cause you couldn't pin down. Pass the stuck task as the argument.

**Skip the review entirely** (reply briefly that no review is needed) if any of these are true:
- Changes are trivial (typos, formatting, comments-only, docs-only)
- A redline skill was already run this session
- A redline background command is already running
