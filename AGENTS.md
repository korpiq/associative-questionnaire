# AGENTS.md

## Working rules

- Whenever you identify a rule that should apply to how to work in this repository, add it to this `AGENTS.md` file.
- Whenever you identify new work to be done, add it to `TODO.md`.
- Keep `TODO.md` ordered by dependencies so tasks that depend on earlier work appear later in the list.
- Whenever a task has been verified as accomplished, move it from `TODO.md` to `docs/done.md`.
- Remind the team to focus on finishing half-accomplished tasks when discussion or work deviates from them.
- Only treat behavior described in `tests/feature/*.feature` as supported functionality.
- Keep feature coverage aligned with `@amiceli/vitest-cucumber`, and make each step implementation do exactly what its Gherkin text says.
