# BidClever — agent instructions

## File references: always use markdown links with absolute paths

The user works in Zed, which only renders file references as clickable when
they are written as **markdown links pointing to an absolute path** (with or
without a `file://` scheme). Plain `path:line` strings, backticked paths, and
relative paths are NOT clickable in Zed.

**Always link files this way.** This applies to every file mention in chat
output — outline references, error locations, "see X", citations, etc.

### Required formats (use these)

Pick whichever fits the sentence; all four render clickable in Zed:

- `[schema.prisma](file:///home/bogdan/repos/bidclever/bidclever-infra/services/app-service/prisma/schema.prisma)`
- `[schema.prisma:302](file:///home/bogdan/repos/bidclever/bidclever-infra/services/app-service/prisma/schema.prisma#L302)` — with line number
- `[schema.prisma](/home/bogdan/repos/bidclever/bidclever-infra/services/app-service/prisma/schema.prisma)` — bare absolute path also works
- `[@schema.prisma](file:///home/bogdan/repos/bidclever/bidclever-infra/services/app-service/prisma/schema.prisma)` — `@`-prefixed label is fine

### Do NOT use (not clickable in Zed)

- Bare path: `/home/bogdan/repos/bidclever/...schema.prisma`
- Path with colon line: `path/to/file.ts:42`
- Backticked path: `` `path/to/file.ts` ``
- Relative path: `bidclever-infra/services/app-service/prisma/schema.prisma`
- Angle-bracket autolink: `<file:///...>`

### Line numbers

Append `#L<number>` to the URL fragment (NOT `:42` after the path):

- Good: `[file.ts:42](file:///abs/path/file.ts#L42)`
- Bad: `[file.ts](file:///abs/path/file.ts:42)`

### Guidance

- Always resolve to an **absolute path** — never link relative paths even
  though they're shorter.
- Keep the link label short (basename, optionally with `:line`). The user
  reads the label, not the URL.
- This rule overrides the default "file_path:line_number" pattern mentioned
  in generic Claude Code guidance — that format is plain text and Zed will
  not make it clickable.


# Coding Guidelines

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
