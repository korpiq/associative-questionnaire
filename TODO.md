# TODO

## deployment v3

- extract one shared deployment-v3 package builder that selects surveys by path and writes the canonical local `deploy/<targetName>/files/root/` and `deploy/<targetName>/files/home/` trees
- update tarball generation to archive `files/root/` entries as absolute target paths and `files/home/` entries as relative target paths, and generate `deploy/<targetName>/deploy.sh` for direct `ssh` and `docker exec` tar streaming
- add executable coverage for path-based packaging, identical local package file lists, generated tarball contents, and generated `deploy.sh`
- switch deployment integration coverage and supporting scripts to the deployment-v3 package commands and generated `deploy.sh`
- remove the replaced preparation and installation commands, CLIs, and helpers that only support the old flows
- remove or replace documentation that still describes the old ways to package or deploy

## after deployment v3

- turn survey sections into tabs with progress indicators and bottom navigation as described in [docs/survey-tabs-design.md](./docs/survey-tabs-design.md)
- ensure survey submit behavior matches [docs/survey-tabs-design.md](/home/kato/omat/associative-questionnaire/docs/survey-tabs-design.md)
- simplify custom CSS and JavaScript customization to the append-only behavior in [docs/custom-asset-overrides.md](./docs/custom-asset-overrides.md)
- record a follow-up design note for future named-entry exclusion in [docs/custom-asset-overrides.md](./docs/custom-asset-overrides.md) if implementation work reveals constraints
- remove or narrow the old shell-script test entrypoints after their replacement Gherkin coverage is verified
- implement the test-suite split from `docs/testing-refactor.md`, including `test:features`, `test:integration`, `test:tooling`, `test:all`, and relevant-suite selection for `npm test`
- turn the README/docs/testing/docs tracking alignment rules from `AGENTS.md` into a `repo-doc-alignment` skill under `.agents/skills`
