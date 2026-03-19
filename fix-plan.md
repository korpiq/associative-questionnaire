# Fix Plan: Sample container deployment fixes

## Goal

Make container deployment honor `targets/sample/target.json` paths, include all sample surveys, avoid exposing the project workspace inside the runtime image, and fix saver/reporter runtime data loading so `visual-showcase.json` is always available.

## Scope

This plan covers all bullets under `TODO.md` -> `Sample container deployment fixes`:

1. httpd root/path mismatch vs `target.json`
2. deploy files according to `target.json`
3. workspace currently visible under `/opt`
4. `override-survey` missing in container
5. saver ENOENT for `visual-showcase.json`

## Plan (dependency order)

1. Add/adjust feature coverage for container path behavior first.
   - Add a scenario in `tests/feature/generated-target-settings.feature` for a `type: container` target.
   - Assert the generated settings include container-resolved public and CGI locations derived from `publicPath`/`cgiPath`, plus `surveysDataDir` and `answersDataDir` from `dataDir`.
   - Extend `tests/feature/specs/generated-target-settings.spec.ts` only as needed for new assertions.
   - Why first: this defines expected path contracts before refactoring CLI/Docker behavior.

2. Introduce a generated container filesystem layout based on target settings.
   - Update `src/cli/prepare-container-assets.ts` to write deploy artifacts into a deterministic staging tree that mirrors target paths (public, cgi, runtime data roots), not only `deploy/generated/public`.
   - Keep `container-target-settings.json` as manifest, but add explicit fields needed by runtime image assembly (resolved httpd docroot and resolved copy destinations).
   - Ensure survey HTML generation loops over all discovered surveys from `loadDeploymentTarget` so `override-survey` is always included.
   - Why second: Dockerfile can then copy from a stable, target-aware generated tree.

3. Remove hard-coded `/opt/...` runtime import coupling in CGI templates.
   - Replace absolute runtime import path in:
     - `deploy/templates/save-survey.js`
     - `deploy/templates/report-survey.template.js`
   - Make runtime module placement configurable from generated settings so CGI scripts always import a path valid for the container layout.
   - Why third: prevents location-specific breakage after moving away from `/opt/associative-survey/app/...`.

4. Update container runtime-data installer to consume manifest paths only.
   - Update `src/cli/install-container-runtime-data.ts` and/or `src/deploy/install-generated-container-runtime-data.ts` so seeded surveys/answers are copied exactly to manifest `surveysDataDir` and `answersDataDir`.
   - Remove fallback assumptions that can diverge from generated target settings when manifest exists.
   - Why fourth: directly addresses ENOENT for missing seeded survey JSON files.

5. Switch Docker image build to a runtime-only filesystem (no workspace exposure).
   - Refactor `Dockerfile` to multi-stage build:
     - build stage: install deps, build TS, run prepare/install helpers
     - runtime stage: copy only required runtime artifacts and static/public files
   - Set `CMD`/httpd root from generated target settings contract (sample target should align with `/srv/www/...` split behavior).
   - Ensure `/opt/associative-survey/app` source tree is absent in final image.
   - Why fifth: this resolves both path mismatch and workspace visibility concerns cleanly.

6. Expand container-level verification scripts for regressions.
   - Update `scripts/test-container.sh` (and possibly `scripts/test-integration.sh`) to assert:
     - survey pages available via configured public path structure
     - `override-survey` endpoint exists
     - save/report works for `visual-showcase` and no ENOENT
     - workspace paths are not present in runtime image (e.g. check expected missing `/opt/associative-survey/app/src`)
   - Keep checks deterministic and non-interactive.

7. Run full verification and update task tracking docs.
   - Run:
     - `npm run check`
     - `npm test`
     - `npm run test:container`
     - `npm run test:integration`
     - `npm run test:visual`
   - If all pass and behavior matches TODO bullet list, move this TODO item to `docs/done.md`.

## Implementation notes

- Keep TypeScript imports extensionless (repository rule).
- Keep feature/spec steps aligned exactly with Gherkin wording.
- Do not commit during interactive work until user accepts.
