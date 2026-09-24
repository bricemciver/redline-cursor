---
name: redline-adversarial
description: Run an adversarial code review using a second Cursor model -- challenge design decisions, probe assumptions, test failure modes. Accepts the same target arguments as redline-review.
---
Run a second-opinion code review with a different Cursor model, as a background shell command.

## Determine the diff flag

Parse the arguments (the text the user typed after `/redline-adversarial`, or the arguments you chose when invoking this skill yourself) to decide what to review. If there are no arguments, default to `--uncommitted`.

| User says | Diff flag |
|---|---|
| *(nothing)* | `--uncommitted` |
| `last N commits` or `N commits` | `--base HEAD~N` |
| `commit <sha>` | `--commit <sha>` |
| `against main` / `vs main` / any branch name | `--base <branch>` |
| `--uncommitted`, `--base ...`, `--commit ...` | Pass through as-is |

For `last N commits`, use `--base HEAD~N` so the reviewer sees the cumulative diff of those N commits.

## Run the review

`<plugin-root>` is the directory two levels above this `SKILL.md` file. Invoke the wrapper script with the diff flag. It picks the review model from the redline config and makes sure it differs from `<current-model>`, which is the model you are running as (use the value from the stop hook's message, or your own model id or name; omit the flag if you don't know it):

```
node "<plugin-root>/scripts/exec.mjs" review --current-model "<current-model>" <diff-flag>
```

Run it in the background (reviews can take several minutes) and wait for it to finish. When the review completes, act as a devil's advocate:
- **Challenge design decisions** -- why was this approach chosen? What alternatives were considered?
- **Probe hidden assumptions** -- what is the code silently relying on?
- **Identify failure modes** -- race conditions, resource exhaustion, stale state, rollback risk
- **Question trade-offs** -- what was sacrificed for this design? Is that acceptable?

Don't just report bugs -- question whether the approach is right. Present findings with severity and actionable recommendations.
