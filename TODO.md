# TODO

- implement the target URL config split from [docs/deployment-tarball-flow.md](/home/kato/omat/associative-questionnaire/docs/deployment-tarball-flow.md) in `target.json`
- make URL generation and test/tooling URL usage follow [docs/deployment-tarball-flow.md](/home/kato/omat/associative-questionnaire/docs/deployment-tarball-flow.md) so configured ports are defined exactly once
- cover and fix the `npm run test:visual` wrong-port submit bug described in [docs/deployment-tarball-flow.md](/home/kato/omat/associative-questionnaire/docs/deployment-tarball-flow.md)
- make container deployment extract the deployable tarball in-container as described in [docs/deployment-tarball-flow.md](/home/kato/omat/associative-questionnaire/docs/deployment-tarball-flow.md)
- remove `setup.sh` from deployment only if tarball extraction alone satisfies [docs/deployment-tarball-flow.md](/home/kato/omat/associative-questionnaire/docs/deployment-tarball-flow.md); otherwise standardize it as the always-run fallback
- persist survey state in browser local storage per page URL as described in [docs/local-storage-design.md](/home/kato/omat/associative-questionnaire/docs/local-storage-design.md)
- remove client-side code paths that prepare to load survey contents from outside local storage, as described in [docs/local-storage-design.md](/home/kato/omat/associative-questionnaire/docs/local-storage-design.md)
- turn survey sections into tabs with progress indicators and bottom navigation as described in [docs/survey-tabs-design.md](/home/kato/omat/associative-questionnaire/docs/survey-tabs-design.md)
- ensure survey submit behavior matches [docs/survey-tabs-design.md](/home/kato/omat/associative-questionnaire/docs/survey-tabs-design.md)
- simplify custom CSS and JavaScript customization to the append-only behavior in [docs/custom-asset-overrides.md](/home/kato/omat/associative-questionnaire/docs/custom-asset-overrides.md)
- record a follow-up design note for future named-entry exclusion in [docs/custom-asset-overrides.md](/home/kato/omat/associative-questionnaire/docs/custom-asset-overrides.md) if implementation work reveals constraints
- remove or narrow the old shell-script test entrypoints after their replacement Gherkin coverage is verified
- replace the remaining standalone `tests/*.test.ts` coverage with Gherkin feature files and sibling `specs/*.spec.ts` step specs so the test tree matches `docs/testing.md`
- implement the test-suite split from `docs/testing-refactor.md`, including `test:features`, `test:integration`, `test:tooling`, `test:all`, and relevant-suite selection for `npm test`
- turn the README/docs/testing/docs tracking alignment rules from `AGENTS.md` into a `repo-doc-alignment` skill under `.agents/skills`
