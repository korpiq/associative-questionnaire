---
name: todo-driven-work
description: Execute repository work directly from TODO tracking. Use when the user asks to work through TODO items, complete tasks in dependency order, begin each step from a green test baseline, add or update executable specifications before implementation, verify the intended red phase, finish green again, hand off to the dry-refactoring skill, move the completed step from TODO to docs/done.md, and do not start the next step until the current one has been committed and refactored.
---

# Todo Driven Work

Work through TODO items as the repository's primary execution queue. Keep scope small and finish one verified step at a time.

## Workflow

1. Read `TODO.md` and take the next item whose dependencies are already satisfied.
2. If discussion drifts away from half-finished work, steer back toward finishing the in-progress TODO item.
3. Run the repository's standard verification commands and confirm the current baseline is green before changing behavior.
4. Use the `executable-specs` skill to add or update the executable specification that describes the intended outcome of the selected step.
5. Run the repository's standard verification commands and confirm the new or changed specification fails in the intended way before implementing the subject behavior.
6. Implement the selected step.
7. Run the repository's standard verification commands again and confirm the full suite is green.
8. Invoke the `dry-refactoring` skill so it preserves the verified task result in a commit and performs one DRY-improvement round.
9. After the task result and any accepted DRY follow-up are complete, remove the step from `TODO.md` and add a matching entry to `docs/done.md`.
10. Confirm the current TODO step and its refactoring have both been committed before taking the next TODO item.
11. Continue in order until reaching the end or until the next step is no longer confidently completable.

## Rules

- Keep `TODO.md` ordered by dependency.
- Use `README.md` as the high-level contract and keep it aligned with `docs/testing.md`.
- Follow the `executable-specs` skill for test-writing instructions.
- Begin and end each TODO step with the repository's standard verification commands passing.
- Start implementation by adding or modifying executable specifications that match the intended outcome.
- Verify that the new or changed specifications fail in the intended way before implementing the subject behavior.
- When working through several TODO items alone, do not batch them into one task-result commit.
- A verified TODO result is not complete until it has been handed to `dry-refactoring` and committed.
- Do not start the next TODO item until the current one has completed its tracking update, dry-refactoring handoff, and commit.
- If a step cannot be completed confidently, stop on that boundary rather than guessing.
