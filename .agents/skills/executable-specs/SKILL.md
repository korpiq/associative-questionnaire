---
name: executable-specs
description: Drive test-first work in this repository through executable specifications, implemented as Gherkin feature files with matching @amiceli/vitest-cucumber TypeScript step specs for product, CLI, build, and deployment behavior.
---

# Executable Specs

Drive supported behavior through executable specifications first, then implement the matching step specs in TypeScript. This skill is the primary source for how automated tests are written in this repository.

## Contract

- `README.md` is the high-level contract for what the project supports.
- Only behavior described in `tests/feature/*.feature` is treated as supported functionality.
- All automated coverage, including integration coverage, belongs under `tests/**` as Gherkin feature tests with matching TypeScript step specs.
- Use this skill as the primary source for test-writing rules. Read other project docs only for the behavior being specified.

## Read Before Writing

- `README.md` for supported behavior and test layout.
- `package.json` for the standard verification commands and real CLI entrypoints.
- For build, runtime, and deployment coverage, read only the relevant project docs before writing scenarios:
  - `docs/system-design.md`
  - `docs/deployment-vps.md`
  - `docs/deployment/ssh.md`
  - `docs/try-it-out.md`

## Workflow

1. Confirm the behavior is supported by `README.md` and/or the relevant design or deployment doc.
2. Write or update the feature file under `tests/feature` or `tests/integration`.
3. Implement the matching step spec in the sibling `specs/` directory with `@amiceli/vitest-cucumber`.
4. Keep each step implementation faithful to the exact Gherkin text.
5. Run the repository standard verification commands: `npm run check` and `npm test`.
6. If the work completes a tracked TODO item, move it from `TODO.md` to `docs/done.md`.

## File Layout

- Use `tests/feature/*.feature` for supported product behavior.
- Use `tests/integration/*.feature` for integration workflows such as CLI, build, container, and deployment checks.
- Pair each feature file with a matching TypeScript step spec in a sibling `specs/*.spec.ts` directory.
- Avoid standalone `.test.ts` or shell-script test suites for supported behavior; express that behavior through feature files and step specs instead.
- If you touch behavior currently covered by old standalone tests, prefer replacing that coverage with feature files instead of adding more non-Gherkin tests.

## Authoring Rules

- Write feature expectations in Gherkin.
- Implement specs with `@amiceli/vitest-cucumber`.
- Make each step do exactly what its Gherkin text says.
- If several scenarios share the same execution step, define it once with `defineSteps`.
- Use `Given` steps only to build scenario state, `When` steps to execute the action, and `Then` steps to assert results or reported errors.
- Shared state is acceptable when earlier steps only prepare data used by a later execution step.
- Prefer concise YAML doc strings for structured inputs, expected outputs, and validation errors.
- Use `Background` for repeated `Given` setup inside one feature.
- Use `Rule` to group scenarios that cover different aspects of one business rule.
- Prefer `But` over `And` when contrast makes the behavior clearer.
- Do not rely on leading indentation inside Gherkin doc strings.

## Background

- Use `Background` to collect repeated `Given` steps shared by every scenario in one feature.
- Prefer `Background` over repeating the same setup lines across multiple scenarios when that setup represents one coherent shared context.
- A longer `Background` is acceptable when it still applies cleanly to every scenario and describes one understandable setup state.
- If only some scenarios need a setup step, keep it inside those scenarios instead, or split the feature so each feature has a clearer shared background.
- Give the feature and any nearby comments enough context that readers can understand what kind of shared setup the `Background` represents.

Example:

```gherkin
Feature: Reporter output

  Background:
    Given survey "team-fit" exists
    And stored answers exist for "team-fit"

  Scenario: Reporter shows respondent count
    When the report is generated for "team-fit"
    Then the report contains "Respondents: 3"

  Scenario: Reporter shows per-question totals
    When the report is generated for "team-fit"
    Then the report contains "Question totals"
```

## Rule

- Use `Rule` when it explains the intent of the enclosed scenarios better than plain scenarios would on their own.
- A `Rule` should answer: "What promise are these scenarios examples of?"
- If that answer is weak, cosmetic, or just repeats the feature title, skip `Rule`.
- If scenarios under one `Rule` need different business-language summaries, they are probably not the same rule.
- A `Rule` may contain one scenario or many; choose it for clarity of intent, not for scenario count.
- Prefer a new feature instead of another `Rule` when the scenarios no longer describe the same behavioral promise.

Example:

```gherkin
Feature: Deployment target configuration

  Rule: SSH targets must declare an SSH address

    Scenario: Missing sshTarget is rejected
      Given target config:
        """
        type: ssh
        """
      When the deployment target configuration is parsed
      Then the deployment target configuration is rejected with "SSH targets must define sshTarget"
```

## CLI, Build, And Deployment Coverage

- For CLI-oriented integration scenarios, execute the real command in the step implementation.
- Keep the command invocation concise and workspace-local.
- Assert against the full captured output, or include it in the expectation message, so failures expose the real command output clearly.
- Cover support workflows such as build output preparation, generated deployable artifacts, container flows, and SSH installation through the same Gherkin-plus-step-spec structure.

## Step Pattern

- `Given` and `And` steps should build scenario state only.
- `When` steps should execute the action under test.
- `Then` and trailing `And` steps should assert the result or reported errors.
- If a step has no immediate side effect beyond preparing state, store that state and let a later execution step perform the action described by its own text.

Example:

```typescript
let answerFilename = ''
let answers: Record<string, string> = {}
let report: object = {}

Given('Answers are stored in file {string}', (_ctx, givenFilename) => {
  answerFilename = givenFilename
})

And('Answer to {string} is {string}', (_ctx, question, answer) => {
  answers[question] = answer
})

When('Survey report is generated', () => {
  fs.writeFileSync(answerFilename, JSON.stringify(answers))
  report = reportSurveyResults(survey, [answerFilename])
})

Then('Report contains results of one answer', () => {
  expect(report.answers.count).toEqual(1)
})
```

In this pattern, the setup steps only store state. The `When` step performs the file write and report generation because those side effects are part of what that step claims to do.

## Verification

- Run `npm run check`.
- Run `npm test`.
