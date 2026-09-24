---
name: redline-setup
description: Configure Redline -- sign in to Cursor and pick the review model
disable-model-invocation: true
---
Run the Redline setup wizard. Answers are persisted to `~/.cursor/redline/config.json` via `scripts/config.mjs`; the review/adversarial/rescue skills read from that file at runtime.

`<plugin-root>` below is the directory two levels above this `SKILL.md` file. Ask each question with your multiple-choice question tool if one is available.

## Step 1: Cursor sign-in

Redline runs reviews through the Cursor CLI (`cursor-agent`) using the user's Cursor account -- no other API keys or providers.

1. If `cursor-agent` is not installed, tell the user to install it (`curl https://cursor.com/install -fsS | bash`) and stop.
2. Run `cursor-agent status`. If it does not report a signed-in user, run `cursor-agent login` (it opens a browser) and wait for it to finish, then re-check `cursor-agent status`.

## Step 2: Review model

Run `cursor-agent models` to get the models this account can use. Present these options, dropping any that are not in that list:

1. `gpt-5.6-sol-high` (Recommended)
2. `claude-opus-5-thinking-high`
3. `cursor-grok-4.6-high`
4. Custom -- any other id from the `cursor-agent models` list

Tell the user that whenever the session's model is known (the stop hook always reports it), reviews use a different model family: if the chosen model matches the session's family, Redline falls back to the first available model from another family.

## Save

```
node "<plugin-root>/scripts/config.mjs" set model=<model-id>
```

This value is read by the `redline-review`, `redline-adversarial`, and `redline-rescue` skills via `scripts/exec.mjs`.
