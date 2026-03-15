# Testing

## Scope

- `README.md` is the high-level contract for what the project supports.
- Only behavior described in `tests/feature/*.feature` is treated as supported.
- Each feature file has a matching spec under `tests/feature/specs`.

## Method

- Write feature expectations in Gherkin.
- Implement specs with `@amiceli/vitest-cucumber`.
- Make each step do exactly what its Gherkin text says.
- If several scenarios share the same execution step, define it once with `defineSteps`.
- Keep structured inputs, expected outputs, and validation errors concise in YAML doc strings inside the feature file.

## Step structure

- `Given` and `And` steps should build scenario state only.
- `When` steps should execute the action under test.
- `Then` and `And` steps should assert the result or reported errors.
- Shared state is acceptable when earlier steps are only preparing data for a later execution step.

## Verification

- Run `npm run check`.
- Run `npm test`.
- Move verified TODO items to `docs/done.md`.
