# Done

1. Defined the questionnaire domain model and Zod schemas.
   Added validated TypeScript/Zod schemas for questionnaire content and saved answer files.

2. Decided the answer file format explicitly.
   Locked the saved-answer JSON structure into the schema layer so later CGI and reporter work can build against it.

3. Reused identical schema parsing `When` steps through `@amiceli/vitest-cucumber` shared steps.
   Centralized the repeated execution step with `defineSteps` so scenarios keep one source of truth for the parse action.

4. Documented the project testing method in `docs/testing.md`.
   Captured the Gherkin-plus-`vitest-cucumber` workflow, shared-step usage, YAML doc string style, verification commands, and linked it from `README.md`.

5. Changed questionnaire sections and questions to keyed objects in the schema contract.
   Removed separate `id` fields from section and question payloads, updated schema validation examples, and aligned `README.md` with the new JSON shape.

6. Documented the planned generator usage in `docs/generator.md`.
   Captured the current purpose, inputs, output, generation flow, and constraints, and linked the document from `README.md`.

7. Added the first generator feature specification slice.
   Defined a standalone-page generation scenario with one section and one question of each supported type in `tests/feature/generate-questionnaire-page.feature`.

8. Normalized keyed questionnaire collections into a stable internal representation.
   Added `normalizeQuestionnaire` to restore ids from object keys and preserve source order for sections, questions, choices, and associative phrases.

9. Implemented the first standalone HTML generator slice.
   Added `generateQuestionnaireHtml`, rendered the supported question types from the normalized questionnaire structure, and verified it against the generator feature spec.

10. Added a runnable generator example under `docs/examples/basic`.
    Included example questionnaire and template inputs, a README with the exact generator command, and a CLI entrypoint that writes a generated HTML file.
