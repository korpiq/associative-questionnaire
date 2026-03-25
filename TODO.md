# TODO

## Implementation

- turn survey sections into tabs with progress indicators and bottom navigation as described in [docs/plans/survey-tabs.md](./docs/plans/survey-tabs.md)
- ensure survey submit behavior matches [docs/plans/survey-tabs.md](./docs/plans/survey-tabs.md)
- simplify custom CSS and JavaScript customization to the append-only behavior in [docs/generator.md](./docs/generator.md)
- record a follow-up design note for future named-entry exclusion in [docs/generator.md](./docs/generator.md) if implementation work reveals constraints
- add an index.html to publicDir in each deployment package: read it from the target directory if present, otherwise use a template that defaults to an empty file; this prevents directory listings from exposing survey names
- remove or narrow the old shell-script test entrypoints after their replacement Gherkin coverage is verified
- implement the test-suite split from `docs/plans/testing-refactor.md`, including `test:features`, `test:integration`, `test:tooling`, `test:all`, and relevant-suite selection for `npm test`
- turn the README/docs/testing/docs tracking alignment rules from `AGENTS.md` into a `repo-doc-alignment` skill under `.agents/skills`
