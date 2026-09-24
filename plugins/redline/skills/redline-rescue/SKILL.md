---
name: redline-rescue
description: Delegate a task to a second Cursor model as a smart friend when you need help or are stuck
---
Delegate a task to a different Cursor model. Run it as a background shell command.

The task is the text the user typed after `/redline-rescue`, or, when you invoke this skill yourself, a description of what you're stuck on, what you've tried, and what you need help with.

`<plugin-root>` is the directory two levels above this `SKILL.md` file. Invoke the wrapper script with the task as a single quoted argument. It picks the helper model from the redline config and makes sure it differs from `<current-model>`, which is the model you are running as (use the value from the stop hook's message, or your own model id or name; omit the flag if you don't know it):

```
node "<plugin-root>/scripts/exec.mjs" rescue --current-model "<current-model>" "<task>"
```

When the helper responds, present the output faithfully without filtering or second-guessing. Do not auto-apply any suggestions -- ask the user which actions to take.
