# Test Refactor Design

## Goal

Refactor the test command layout so the repository has one clear test surface per intent:

- `npm run test:features` runs all feature tests for production code only under `tests/feature`.
- `npm run test:integration` runs all tests for build, deploy, and deployed-system behavior only under `tests/integration`.
- `npm run test:tooling` runs all tests for project tooling, including manual tools such as `clean` and `nuke`, under `tests/tooling`.
- `npm run test:all` runs all of the above.
- `npm test` runs only a relevant subset of the above, limited to tests that touch code that is uncommitted, staged, or part of the latest commit that changed code.

## Current State

The current test layout is between two models:

- `vitest.config.ts` includes `tests/feature/specs/**/*.spec.ts`, `tests/integration/specs/**/*.spec.ts`, and every `tests/**/*.test.ts`.
- `vitest.tooling.config.ts` separately includes `tests/tooling/specs/**/*.spec.ts`.
- `npm test` currently runs almost everything in the main Vitest config.
- there is no dedicated `npm run test:integration` suite command yet.
- Tooling coverage is split between `tests/tooling` and standalone `tests/*.test.ts` files such as `normalize-survey.test.ts`, `read-target-name-argument.test.ts`, `list-target-deployed-surveys.test.ts`, `install-generated-container-runtime-data.test.ts`, and `index.test.ts`.

This makes the supported test surface harder to reason about:

- directory purpose is not yet the same thing as command purpose;
- some tooling tests still live outside `tests/tooling`;
- integration still depends partly on legacy shell-script entrypoints outside the main test command surface;
- `npm test` has no explicit changed-code selection rule.

## Target Shape

The refactor should produce three explicit suites and two aggregations.

### Features

`test:features` should cover only production-code behavior that does not require build/deploy system setup beyond normal in-process test fixtures.

Expected include pattern:

```text
tests/feature/specs/**/*.spec.ts
```

This suite should exclude:

- `tests/integration/**`
- `tests/tooling/**`
- leftover standalone `tests/*.test.ts`

### Integration

`test:integration` should cover build, packaging, deployment preparation, deployed container behavior, deployed SSH behavior, and similar end-to-end or environment-heavy checks.

Expected include pattern:

```text
tests/integration/specs/**/*.spec.ts
```

This command should provide the dedicated integration-suite entrypoint.

### Tooling

`test:tooling` should own tests for repository tools and operator-facing helper commands, including manual helpers when they need smoke coverage.

Expected include pattern:

```text
tests/tooling/specs/**/*.spec.ts
```

After the refactor, tests for `clean`, `nuke`, target-listing, CLI helper behavior, visual-launch smoke behavior, and similar repository-tool concerns should live here instead of in standalone `tests/*.test.ts`.

### All

`test:all` should be the explicit full-suite command. It should run:

1. `test:features`
2. `test:integration`
3. `test:tooling`

Running the suites separately keeps boundaries visible and avoids hiding category mistakes behind one broad include glob.

### Default `npm test`

`npm test` should become a changed-code-aware selector instead of a synonym for the whole suite.

Its scope should be:

- files changed in the working tree;
- staged files;
- files touched by `HEAD`, but only when that commit contains code changes.

Its exclusion rule should be:

- do not run suites that exercise only code with no recent changes.

In practice, `npm test` should map changed source files to affected suites, then run only those suites. If a change spans multiple areas, it should run multiple suites. If the selection logic cannot classify a change confidently, it should fail safe by running `test:all`.

## Proposed Command Structure

One workable target layout is:

```json
{
  "test": "node --import tsx scripts/run-relevant-tests.ts",
  "test:features": "vitest run --config vitest.features.config.ts",
  "test:integration": "vitest run --config vitest.integration.config.ts",
  "test:tooling": "vitest run --config vitest.tooling.config.ts",
  "test:all": "npm run test:features && npm run test:integration && npm run test:tooling"
}
```

Notes:

- `test:tooling` already has the right broad shape and can likely keep its current config file.
- `vitest.config.ts` can either disappear or become a thin shared base imported by the suite-specific configs.
- `test:integration` should be introduced only once the Gherkin integration specs fully own that coverage.

## Test Relocation Rules

To make the command split durable, file placement must match suite intent:

- production behavior specs stay under `tests/feature`;
- build/deploy/deployed-system specs stay under `tests/integration`;
- repository-tool and manual-helper specs stay under `tests/tooling`;
- standalone `tests/*.test.ts` files should be migrated or deleted.

The existing standalone tests appear to belong mostly in `tests/tooling`, because they verify repository commands and support utilities rather than product behavior described in `tests/feature/*.feature`.

## Relevant-Test Selection Design

`npm test` needs a small selector program rather than more shell wrappers.

Responsibilities:

1. Collect recently changed files from the worktree, the index, and the latest commit.
2. Ignore non-code-only commits when deciding whether `HEAD` adds extra scope.
3. Map changed paths to suites.
4. Run the minimal set of suites.
5. Fall back to `test:all` when mapping is ambiguous.

Initial path mapping can be simple:

- `src/generator/**`, `src/cgi/**`, `src/reporting/**`, shared runtime code, and `tests/feature/**` changes imply `test:features`.
- `src/deploy/**`, container assets, SSH installer code, generated deployment packaging, and `tests/integration/**` changes imply `test:integration`.
- `src/cli/**`, `scripts/**`, tooling-only helpers, root config/scripts, and `tests/tooling/**` changes imply `test:tooling`.
- shared cross-cutting files such as `package.json`, TypeScript config, Vitest config, and reusable test helpers should imply `test:all`.

This logic should stay explicit in code rather than inferred indirectly from Vitest globs.

## Migration Plan

1. Introduce suite-specific Vitest configs for features and integration.
2. Add `test:features` and `test:all`.
3. Introduce `test:integration` as the integration spec suite entrypoint.
4. Migrate remaining standalone `tests/*.test.ts` files into `tests/tooling` executable specs or otherwise place them under the correct suite.
5. Add a relevant-test selector script for `npm test`.
6. Update `docs/testing.md`, `README.md`, and any task-tracking docs to describe the new command contract.
7. Remove obsolete shell test entrypoints once their replacement coverage is verified and any retained manual helpers are clearly named as manual tools.

## Acceptance Criteria

The refactor is complete when all of the following are true:

- each supported automated test command maps to exactly one documented suite purpose;
- `tests/feature`, `tests/integration`, and `tests/tooling` are the only suite roots;
- no supported automated coverage depends on legacy shell-script test entrypoints;
- `npm run test:all` runs the full suite through the three documented targets;
- `npm test` runs only relevant suites for recent code changes, with a safe fallback to the full suite;
- `docs/testing.md` documents the final command contract clearly enough that `README.md` can refer to it without caveats.

## Non-Goals

- changing the product contract away from executable specs;
- broadening support to behaviors not described by `tests/feature/*.feature`;
- preserving old command names if they conflict with the clearer suite split.
