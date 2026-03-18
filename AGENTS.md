# AGENTS.md

## Working rules

- Whenever you identify a rule that should apply to how to work in this repository, add it to this `AGENTS.md` file.
- Whenever you identify new work to be done, add it to `TODO.md`.
- Keep `TODO.md` ordered by dependencies so tasks that depend on earlier work appear later in the list.
- Whenever a task has been verified as accomplished, move it from `TODO.md` to `docs/done.md`.
- Remind the team to focus on finishing half-accomplished tasks when discussion or work deviates from them.
- Use [README.md](/home/kato/omat/associative-questionnaire/README.md) as the high-level project contract and keep it aligned with the current testing guidance in `docs/testing.md`.
- Only treat behavior described in `tests/feature/*.feature` as supported functionality.
- Keep feature coverage aligned with `@amiceli/vitest-cucumber`, and make each step implementation do exactly what its Gherkin text says.
- Do not use `.js` file extensions in TypeScript import specifiers in this repository.
- Prefer concise YAML doc strings in Gherkin steps when tests need to show structured input, output, or validation errors.
- Keep HTML and CSS indented for readability in templates, examples, and generated snippet source files.
- Do not use `/tmp` for repository work; write generated files either to the current directory for user-facing command examples or to a dedicated directory inside the workspace.
- When working interactively with user, do not commit until user accepts.
- When told to do several TODO steps alone, commit after each verified TODO step before starting the next one.
- Commit messages must use a single-line task topic, then a blank line, then concise lines describing decisions, concrete actions, and any later follow-up ideas.
