# Testing

## Scope

- `README.md` is the high-level contract for what the project supports.
- Only behavior described in `tests/feature/*.feature` is treated as supported.
- All automated tests, including integration coverage, are Gherkin feature tests under `tests/`.
- Each feature file has a matching step spec in a sibling `specs/` directory as `*.spec.ts`.
- Avoid standalone `.test.ts` or shell-script test suites for supported behavior; express that behavior through feature files and step specs instead.

## Method

- Write feature expectations in Gherkin.
- Implement specs with `@amiceli/vitest-cucumber`.
- Make each step do exactly what its Gherkin text says.
- If several scenarios share the same execution step, define it once with `defineSteps`.
- Keep structured inputs, expected outputs, and validation errors concise in YAML doc strings inside the feature file.
- Use `Background` to collect common `Given` steps shared by scenarios in one feature.
- Use `Rule` to group scenarios that describe different aspects of the same business rule.
- Prefer `But` instead of `And` when the contrast makes the intended behavior clearer.
- Do not rely on leading indentation inside Gherkin doc strings. The parser normalizes doc-string indentation, so nested structure should use YAML forms that remain valid after that trimming.
- For CLI-oriented integration scenarios, run the associated command directly in the step implementation, keep the invocation concise, and assert against the full captured output or include that output in the expectation message so failed tests show the command output clearly.

## Step structure

- `Given` and `And` steps should build scenario state only.
- `When` steps should execute the action under test.
- `Then` and `And` steps should assert the result or reported errors.
- Shared state is acceptable when earlier steps are only preparing data for a later execution step.

## Verification

- Run `npm run check`.
- Run `npm test`.
- Move verified TODO items to `docs/done.md`.
