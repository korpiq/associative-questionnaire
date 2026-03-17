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

11. Switched the generator to a template engine.
    Replaced the manual HTML token replacement flow with `handlebars` rendering while keeping the generator feature and runnable example working.

12. Extracted generator snippets to separate files.
    Moved the root, section, question, style, and script snippets out of the generator source and loaded them from `src/generator/snippets/`.

13. Added the default associative linker snippet.
    Implemented drag and keyboard association toggling in the default script snippet, updated the associative markup and styles, and verified the behavior with generated-HTML browser tests.

14. Enabled snippet overrides from the HTML template.
    Registered all generator snippets as named partials, documented the override pattern, and verified inline partial overrides for section, question, style, and script snippets.

15. Added visual line drawing for associative links.
    Positioned phrase groups on the outer thirds, kept the center open for SVG link lines, rendered a live drag line during linking, and kept stored lines visible until the same link was recreated to undo it.

16. Fixed mobile tap linking for associative phrases.
    Deferred drag activation until pointer movement so taps no longer overwrite the pending phrase, added Gherkin coverage for tap-to-link toggling, and verified that stored lines still update correctly.

17. Enabled mobile drag linking for associative phrases.
    Switched the drag interaction to pointer events, prevented touch scrolling from stealing phrase drags, added touch-drag Gherkin coverage, and kept desktop drag and tap-to-link behavior working.

18. Added a runnable example that overrides every generator snippet.
    Documented a full `root`/`section`/`question`/`style`/`script` override example under `docs/examples/snippet-overrides`, verified it by generating the standalone page, and kept TODO tracking aligned.

19. Added a combined system design document for generated pages, the CGI saver, and the reporter.
    Captured the shared deployment model for VPS and container targets, proposed static and runtime directory layouts, defined the cross-component submission and reporting flow, and identified the submit-action and questionnaire-name tasks that should be completed before the CGI and reporter work.

20. Refactored active repository terminology from questionnaire to survey.
    Renamed the schema, normalization, generator, and CLI APIs to `survey` terms, updated the supported feature/spec wording and examples to match, and kept the full test suite and typecheck passing through the rename.

21. Added survey-level metadata support to the schema and normalization flow.
    Introduced optional `protected: true` support on surveys, verified acceptance and rejection behavior through schema feature coverage, preserved the metadata in normalized surveys, and kept the full test suite and typecheck passing.

22. Added optional correct-answer support to survey questions.
    Extended all question schema variants with optional `correct` definitions, validated that configured correct answers match the defined survey content, preserved them through normalization, and verified the change with schema, normalization, full-suite, and typecheck coverage.
