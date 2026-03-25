# TODO

## Docs update (see docs/docs-update-plan.md)

- [docs-1] cleanup: create docs/plans/, move docs/survey-tabs-design.md → docs/plans/survey-tabs.md and docs/testing-refactor.md → docs/plans/testing-refactor.md; remove docs/later.md, docs/cgi-reporter.md, docs/examples/, and all v2/v3/vps/tarball deployment planning docs; remove docs/local-storage-design.md and docs/system-design.md after their replacements exist
- [docs-2] write docs/architecture.md (concise rewrite of system-design.md: goals, non-goals, components, filesystem layout, runtime model, deployment styles)
- [docs-3] update docs/generator.md (add survey.json schema and question type shapes; verify snippet override and custom asset sections are current)
- [docs-4] create docs/configuration.md from deployment-targets.md (targets/ directory layout, target.json field reference, survey file placement)
- [docs-5] write docs/deployment.md (package:target and package:survey commands, deploy/ output structure, running deploy.sh for SSH and container)
- [docs-6] write docs/survey-page.md (local storage rules and association linker interaction, from feature specs)
- [docs-7] rewrite README.md (one-paragraph summary, quickstart, pointers to all docs/)

## Implementation

- turn survey sections into tabs with progress indicators and bottom navigation as described in [docs/plans/survey-tabs.md](./docs/plans/survey-tabs.md)
- ensure survey submit behavior matches [docs/plans/survey-tabs.md](./docs/plans/survey-tabs.md)
- simplify custom CSS and JavaScript customization to the append-only behavior in [docs/custom-asset-overrides.md](./docs/custom-asset-overrides.md)
- record a follow-up design note for future named-entry exclusion in [docs/custom-asset-overrides.md](./docs/custom-asset-overrides.md) if implementation work reveals constraints
- remove or narrow the old shell-script test entrypoints after their replacement Gherkin coverage is verified
- implement the test-suite split from `docs/plans/testing-refactor.md`, including `test:features`, `test:integration`, `test:tooling`, `test:all`, and relevant-suite selection for `npm test`
- turn the README/docs/testing/docs tracking alignment rules from `AGENTS.md` into a `repo-doc-alignment` skill under `.agents/skills`
