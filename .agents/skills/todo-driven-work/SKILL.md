---
name: todo-driven-work
description: Execute repository work directly from TODO tracking. Use when the user asks to work through TODO items, complete tasks in dependency order, verify each finished step, move it from TODO to docs/done.md, then hand off to the dry-refactoring skill for the commit and one code-quality improvement round before starting the next step.
---

# Todo Driven Work

Work through TODO items as the repository's primary execution queue. Keep scope small and finish one verified step at a time.

## Workflow

1. Read `TODO.md` and take the next item whose dependencies are already satisfied.
2. If discussion drifts away from half-finished work, steer back toward finishing the in-progress TODO item.
3. Implement the selected step.
4. Run the repository's standard verification commands.
5. If the step is verified, remove it from `TODO.md` and add a matching entry to `docs/done.md`.
6. Invoke the `dry-refactoring` skill so it preserves the verified task result in a commit and performs one DRY-improvement round before the next TODO item.
7. Continue in order until reaching the end or until the next step is no longer confidently completable.

## Rules

- Keep `TODO.md` ordered by dependency.
- Use `README.md` as the high-level contract and keep it aligned with `docs/testing.md`.
- When working through several TODO items alone, do not batch them into one task-result commit.
- Always hand a verified TODO result to `dry-refactoring` before starting the next TODO item.
- If a step cannot be completed confidently, stop on that boundary rather than guessing.
