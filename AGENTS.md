# AGENTS.md

## Working rules

### Structure

- Keep `## Working rules` organized under short subtopics so related rules stay easy to scan.
- Repository-local reusable skills live under `.agents/skills`.
- Whenever you identify a rule that should apply to how to work in this repository, add it to this `AGENTS.md` file.

### Tracking

- Whenever you identify new work to be done, add it to `TODO.md`.
- Keep `TODO.md` ordered by dependencies so tasks that depend on earlier work appear later in the list.
- Whenever a task has been verified as accomplished, move it from `TODO.md` to `docs/done.md`.
- Remind the team to focus on finishing half-accomplished tasks when discussion or work deviates from them.

### Product Contract

- Use [README.md](/home/kato/omat/associative-questionnaire/README.md) as the high-level project contract and keep it aligned with the current testing guidance in `docs/testing.md`.
- Only treat behavior described in `tests/feature/*.feature` as supported functionality.

### Tests

- Keep the `executable-specs` skill as the primary source for automated test-writing instructions.
- Use the `executable-specs` skill for automated test coverage changes, including CLI, build, and deployment behavior.

### Code And Files

- Keep HTML and CSS indented for readability in templates, examples, and generated snippet source files.
- Do not use `.js` file extensions in TypeScript import specifiers in this repository.
- Do not use `/tmp` for repository work; write generated files either to the current directory for user-facing command examples or to a dedicated directory inside the workspace.

### Workflow

- When working interactively with user, do not commit until user accepts.
- When working through TODO items, use the `todo-driven-work` skill.
- When working independently, avoid custom or narrowly targeted verification commands that the user is not present to approve; prefer the full standard test set instead.

### Commits

- Commit messages must use a single-line task topic, then a blank line, then concise lines describing decisions, concrete actions, and any later follow-up ideas.

### Deployment

- For deployment v2, prefer `esbuild` for bundling generated CGI scripts into single self-contained files, and do not treat runtime data-file access as something to eliminate.

### Documentation

- If tracked documentation files already have updates in the worktree, include them in commits; do not sweep in new untracked documentation files unless they are part of the current task.
