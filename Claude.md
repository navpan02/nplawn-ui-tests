# CLAUDE.md — Personal Projects

> This file guides Claude across all my personal projects. It reflects how I like to work:
> ship things, learn along the way, and keep the code clean enough that future-me isn't angry.

---

## Who I Am

Freelance developer building web apps (React, Next.js), mobile apps, automation scripts,
and AI-powered tools. Intermediate comfort with the terminal — I know my way around but
appreciate a heads-up when a command has teeth. I care equally about shipping fast,
writing clean code, and actually understanding what I'm building.

---

## How I Want Claude to Work With Me

- **Explain, then execute.** Before writing code, briefly describe the approach. One or two
  sentences is enough — I don't need an essay, just enough to know what we're doing and why.
- **Flag the trade-offs.** If there's a "fast way" and a "right way" and they differ,
  tell me both and let me choose. Don't silently pick one.
- **Teach when it matters.** If we're doing something I likely haven't seen before, add a
  short comment or note explaining the concept — not a tutorial, just enough to make it stick.
- **Don't over-engineer.** I'm building personal projects, not enterprise systems. Reach for
  simple before reaching for clever.
- **Match my pace.** If I'm clearly in "ship mode," stay lean. If I'm asking questions and
  exploring, slow down and explain more.

---

## Context Rot Prevention (Session Hygiene)

Long sessions get messy. Here's how we keep them clean:

### Start of Every Session
- Read this CLAUDE.md before doing anything.
- If the project has a `PROJECT.md` or `TASKS.md` in the root, read that too.
- Confirm with me: what's the goal for this session? Don't assume from context.
- Check the current git branch before touching any files (`git branch`).

### During a Session
- **Stay on task.** If you spot something broken that's outside our current scope, flag it
  and add it to TASKS.md — don't chase it unless I say so.
- **Use `/compact`** if the session gets long or starts to feel unfocused (after lots of
  back-and-forth or large output dumps). Better to compact early than drift late.
- If you catch yourself repeating an earlier suggestion or contradicting something we already
  decided, say so — don't quietly re-litigate it.

### End of Every Session
- Summarize: what got done, what's still open, and any decisions we made.
- Suggest anything worth adding to `TASKS.md` or `PROJECT.md`.
- Note any tech debt introduced for speed — I want to know about it even if I accepted it.

---

## Universal Rules (All Projects)

### Security Basics
- **No secrets in code.** API keys, tokens, passwords — always in `.env` files, never
  committed. `.env` is always in `.gitignore`.
- Only commit `.env.example` with placeholder values as a template.
- Never use `dangerouslySetInnerHTML` in React without explicit sanitization.
- Don't introduce a new auth or session management approach without flagging it first.

### Git Hygiene
- Always confirm the current branch before making changes.
- Never push directly to `main` without checking with me first.
- Write clear, descriptive commit messages — not "fix stuff" or "update."
- Keep commits focused. One logical change per commit where possible.

### Dependencies
- Don't add a new npm/pip/brew package without mentioning it first.
- Prefer well-maintained, widely-used packages over niche ones.
- If a native solution exists and it's not significantly harder, prefer it over adding a
  dependency.

### What Needs My Explicit OK
- Deleting or renaming files
- Any database schema change (migration, drop, alter)
- Running anything against a production or live environment
- Installing or upgrading major dependencies
- Changing how auth or data storage works

---

## Project Type Conventions

### Web Apps (React / Next.js)
- Check how existing components are structured before creating new ones — follow the pattern.
- Prefer named exports. Use TypeScript if the project already uses it.
- State management: use what's already in the project. Don't introduce a new library without
  flagging it.
- Every data-fetching component must handle: loading state, error state, and empty state.
- Flag anything that meaningfully increases bundle size.
- For Next.js: be explicit about whether something should be a Server Component or Client
  Component, and why.

### Mobile Apps
- Specify which platform/framework is in use at session start (React Native, Expo, etc.).
- Flag anything that behaves differently between iOS and Android.
- Don't introduce native modules without discussing them first — they add complexity to builds.
- Test assumptions about device permissions (camera, location, notifications) — don't assume
  they'll be granted.

### Automation / Scripts
- Scripts must be idempotent where possible — running twice shouldn't cause double damage.
- Always add a dry-run mode or confirmation prompt before destructive operations
  (file deletion, bulk edits, API writes).
- Add basic logging so I can see what the script did when I run it later.
- Scripts that touch the filesystem should validate paths before acting.

### AI-Powered Tools
- Specify the model, provider, and API at session start.
- Prompts and system messages belong in dedicated files or constants — not scattered inline.
- Always handle API errors and rate limits gracefully — never let a failed API call silently
  break the user experience.
- Be explicit about what data is being sent to an external AI API — flag any PII risk.
- Streaming vs. non-streaming: confirm which pattern the project uses before implementing.
- Token costs matter for personal projects — flag if a design choice could be unexpectedly
  expensive at scale.

---

## Code Quality Standards

- **Consistency over perfection.** Match the existing style of the project before introducing
  a "better" pattern. Flag it if you want to suggest a change.
- **Comments for the non-obvious.** Don't comment what the code obviously does. Do comment
  *why* something is done a non-obvious way.
- **No dead code.** Don't leave commented-out blocks or unused variables — delete them.
- **Error handling is not optional.** Every async operation needs error handling. Every
  external API call needs a failure path.
- **Keep functions small.** If a function is doing more than one thing, name the problem
  and suggest splitting it.

---

## Learning Mode

Since I want to actually understand what I'm building:

- When we use a pattern I might not be familiar with (e.g., a specific React hook pattern,
  a new API, an async technique), add a brief inline comment explaining the concept.
- If there's a common mistake people make with something we're implementing, mention it.
- When there are two valid approaches, briefly explain why you're recommending one over the
  other — don't just pick silently.
- If I ask "why does this work," always answer it directly before moving on.

---

## Per-Project Context

Each project should have its own `PROJECT.md` in the repo root with:

```
# PROJECT.md

## What This Is
[One paragraph on what the project does]

## Stack
[Languages, frameworks, key libraries]

## Current Status
[What's done, what's in progress]

## Active Task
[What I'm working on right now — update this each session]

## Known Issues / Tech Debt
[Things to fix later]

## Off-Limits Right Now
[Areas under active work or that shouldn't be touched this session]
```

If `PROJECT.md` doesn't exist yet, suggest creating it at the start of the first session.

---

## Things I Don't Want

- Long explanations when a short one will do.
- Unsolicited refactoring of code outside the current task.
- New abstractions or patterns introduced without flagging them.
- Assumptions about my stack or setup — ask if unsure.
- Excessive caveats — trust me to make decisions once you've explained the trade-offs.

---

*Last updated: [DATE]*
*Tip: update the "Current Status" and "Active Task" in each PROJECT.md at the end of every session.*
