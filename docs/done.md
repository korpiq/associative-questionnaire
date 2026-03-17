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

23. Added generator submit support and derived survey names.
    Extended the generator feature coverage for submit buttons, POST form actions, and derived `surveyName`, propagated the filename-derived name through the generator and CLI, and updated the runnable docs examples to use the saver CGI form-action argument.

24. Added feature coverage for CGI answer normalization from browser form fields.
    Specified the supported single-choice, multi-choice, free-text, and associative field mapping into saved answer files, added a pure normalizer that derives answer types from the survey definition, and verified rejection of malformed associative JSON.

25. Implemented CGI request parsing for URL-encoded survey submissions.
    Added feature coverage for native `application/x-www-form-urlencoded` browser bodies, parsed repeated fields into the shared browser-field shape, and normalized the parsed body into the validated saved answer schema.

26. Added saver-side answer validation and hashed respondent filenames.
    Validated normalized answers against the survey definition before saving, added deterministic hashed respondent filenames from the selected CGI headers plus optional deployment salt, and verified both behaviors through feature coverage.

27. Implemented saver runtime answer storage creation under the effective user home.
    Added filesystem-backed feature coverage for the runtime answers root and per-survey directory, resolved the storage path under `~/.local/share/associative-survey/answers`, and created the required directories on demand.

28. Implemented shared saver-path answer persistence.
    Composed request-body parsing, survey-aware answer validation, respondent filename hashing, and runtime storage into one persistence function, and verified that repeat submissions from the same respondent replace the existing file for that survey.

29. Added a manual saver helper and try-it-out guide.
    Added a `manual:save` CLI helper for exercising the current saver path without a CGI wrapper, documented generator and saver tryout flows in `docs/try-it-out.md`, and linked the guide from the README.

30. Added saver CGI HTML responses with redirect and CSS overrides.
    Covered built-in success and failure pages plus the `ok`, `fail`, and `css` parameters in feature tests, and implemented a CGI-ready response builder that returns HTML by default and redirects with `303` when override URLs are provided.

31. Added reporter survey upload, runtime storage, and survey-name resolution.
    Covered runtime survey upload and later stored-survey resolution by `surveyName`, validated uploaded survey JSON before storing it under `~/.local/share/associative-survey/surveys`, and resolved the stored survey plus matching answer directory for later reporting work.

32. Added deploy-time support for reporter protection secrets.
    Added a deploy helper that generates a reporter protection secret, injects it into a reporter script template through a fixed placeholder, and stores the same secret under the local deployment workspace for later protected-survey access.

33. Enforced protected survey upload and report access through reporter hashes.
    Added feature coverage for protected replacement uploads and protected report resolution, derived lowercase hex `sha256(surveyName + secret)` access hashes, and required the correct hash whenever a stored protected survey is replaced or resolved for reporting.

34. Validated stored reporter answer files during survey resolution.
    Added reporter-resolution coverage for valid and invalid stored answer files, and extended stored reporter survey resolution to parse every saved answer file through the shared answer schema before later reporting code can use it.

35. Added reporter totals and per-question statistics.
    Computed respondent totals plus per-question counts and percentages for single-choice, multi-choice, free-text, and associative answers from the validated survey and saved answer files.
