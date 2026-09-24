<p align="center">
  <img src="logo.jpeg" alt="redline" width="300">
</p>

# redline

A Cursor plugin for **automatic** code review, adversarial review, and rescue delegation -- by a second Cursor model.

Reviews run through the Cursor CLI on your Cursor account, always using a different model family than the one that wrote the code, so you get a genuine second opinion.

## The model decides

Redline's key principle: **the agent decides what help it needs.** After each response, a lightweight `stop` hook checks whether there are uncommitted code changes. If so, the agent evaluates the context and picks the most helpful action:

- `/redline-review` -- standard code review
- `/redline-adversarial` -- challenge design decisions, probe hidden assumptions, test failure modes
- `/redline-rescue` -- delegate a task to a second model as a smart friend

No hardcoded triggers, no diff thresholds. The model is in the best position to decide.

## How it works

```
Cursor stop hook (fires after each agent response)
  -> sends a follow-up asking the agent to consult the redline-check skill
  -> the agent decides based on what it just did:
      run a review, challenge the design, delegate to a second model, or skip
  -> the review runs in a read-only `cursor-agent` on a different model
  -> fires at most once per turn (loop_limit: 1), so no loops
```

The `redline-check` skill holds the decision-making guidance. The hook is just a minimal nudge.

Reviews happen **automatically** -- no manual invocation needed. You can also run any skill directly at any time.

## Install

Add this repository as a plugin marketplace in Cursor (or install `redline` from the Cursor marketplace once published), then run `/redline-setup` to sign in to Cursor and pick the review model.

### Development

Cursor loads local plugins from `~/.cursor/plugins/local/`. Symlinks are only followed when their target is inside that directory, so copy the plugin in:

```bash
rsync -a --delete ./plugins/redline/ ~/.cursor/plugins/local/redline/
```

Then run **Developer: Reload Window**. Check the **Hooks** output channel to debug the `stop` hook. Run the model-selection tests with `node --test plugins/redline/scripts/lib/`.

## Skills

| Skill | Description |
|---------|-------------|
| `/redline-setup` | Sign in to Cursor and pick the review model |
| `/redline-review [target]` | Run a standard code review (defaults to uncommitted changes) |
| `/redline-adversarial [target]` | Challenge design decisions, probe assumptions, test failure modes |
| `/redline-rescue <task>` | Delegate a task to a second model for help when stuck |

### `/redline-review [target]`

Standard code review. By default reviews uncommitted changes. Pass an argument to review other diffs:

```
/redline-review                    # uncommitted changes (default)
/redline-review last 3 commits     # cumulative diff of last 3 commits
/redline-review against main       # changes vs main branch
/redline-review commit abc123      # single commit
```

### `/redline-adversarial [target]`

Goes beyond bug-finding. Challenges design decisions, probes hidden assumptions (what is the code silently relying on?), identifies failure modes (race conditions, resource exhaustion, stale state), and questions trade-offs. Accepts the same target arguments as `/redline-review`.

### `/redline-rescue`

When you're stuck -- hand the problem to a second model. Describe what you're working on and what you need help with. It works on it in the background (read-only). Results are presented faithfully -- the agent doesn't filter or second-guess them. You decide which suggestions to act on.

## Configuration

During `/redline-setup`, pick the review **model** -- `gpt-5.6-sol-high` (default), `claude-opus-5-thinking-high`, `cursor-grok-4.6-high`, or any id from `cursor-agent models`. Reasoning effort is part of the Cursor model id.

The review model never shares a family with the session's model. If your choice matches (say, both are Claude), Redline falls back to the first available model from another family. Models your account can't use are skipped.

Settings are stored in `~/.cursor/redline/config.json` (outside the plugin directory, so they survive plugin updates).

## Authentication

Redline only uses your Cursor account, through the Cursor CLI:

```bash
cursor-agent login    # or run /redline-setup
cursor-agent status
```

## Customization

Every skill is a plain markdown file in `skills/<name>/SKILL.md`. Edit them to fit your project:

- **Focus the review** -- add "pay special attention to SQL injection and auth boundaries" to `redline-review/SKILL.md`
- **Change the adversarial persona** -- make it focus on performance, security, or accessibility instead of general design
- **Adjust rescue behavior** -- tell the helper to always suggest tests, or to explain its reasoning step-by-step

No scripts to modify, no config flags to learn. Just edit the markdown and reload the window.

## Why Redline?

Compared to other ways of reviewing agent-written code:

| | Redline | Other plugins |
|---|---|---|
| **Models** | Any Cursor model, always a different family than the author | Often the same model reviewing its own work |
| **Automatic reviews** | Stop hook triggers automatically, model decides when to review | Manual invocation only |
| **Customizable** | Edit plain markdown skills to change review behavior | Skills are often hardcoded or complex to modify |
| **Simplicity** | ~13 files, no build step | Often 30+ files across scripts, agents, and configs |

## Requirements

- [Cursor](https://cursor.com) account
- [Cursor CLI](https://cursor.com/cli) (`cursor-agent`), signed in

## License

MIT
