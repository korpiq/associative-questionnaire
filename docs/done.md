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

36. Added reporter correctness statistics for questions with correct answers.
    Extended reporter statistics to compute correct and incorrect counts and percentages only for questions that define `correct` answers, covering single-choice, multi-choice, free-text, and associative correctness rules.

37. Added grouped reporter statistics parameters.
    Extended reporter statistics with caller-provided `groupBy` question identifiers and optional `recipientCount`, producing grouped respondent counts and recipient percentages alongside the existing report totals and per-question statistics.

38. Added reporter HTML output as a CGI-ready page.
    Rendered one HTML report page per requested `surveyName`, showing the survey title, respondent totals, grouped results, and per-question statistics from the current reporter statistics object.

39. Added simple graphics to the reporter HTML page.
    Extended the reporter page with inline visual bar summaries for percentages in per-question and grouped statistics, and covered the graphics markup through the reporter HTML feature tests.

40. Documented VPS deployment for the current survey system.
    Added a deployment guide for preparing public CGI assets, installing runtime survey JSON under the effective CGI user home, and handling the locally stored reporter protection secret.

41. Added a runnable Docker deployment path with end-to-end verification.
    Added deploy preparation assets, plain JavaScript CGI entrypoints, a bundled CGI runtime, a Dockerfile that serves a survey plus saver and reporter from one container, and an automated Docker test that builds the image, submits answers, and verifies the report.

42. Replaced saver respondent hashing with month-long respondent cookies.
    Switched saver persistence from header-derived respondent file hashes to pseudorandom cookie ids, set a one-month `Set-Cookie` value on the first successful save, reused existing cookie ids on later saves, and updated the saver tests, docs, and manual helper accordingly.

43. Reformatted structured feature doc strings into readable multiline YAML.
    Reworked dense one-line survey, answer, and parameter fixtures across the feature files into readable multiline YAML or JSON, preserved raw payload steps where the specs intentionally pass literal JSON strings, and verified the full suite and typecheck after the parser-sensitive cleanup.

44. Refined feature scenarios for clearer behavior-focused coverage.
    Split broad generator and protected-access scenarios into smaller behavior-specific examples, shortened saver response scenario titles to match their single responsibility, moved shared setup into shared step definitions, and verified the expanded feature set with the full suite and typecheck.

45. Reindented template and snippet HTML/CSS sources for readability.
    Reformatted the core Handlebars generator snippets and the snippet-override example template with consistent nested HTML indentation and multiline CSS blocks, kept behavior unchanged, and verified the full suite and typecheck after the formatting-only pass.

46. Adopted the snippet-override visual style as the default survey theme.
    Reworked the default generator root, section, question, and style snippets to use the showcase layout and palette as the baseline survey presentation, added generator coverage for the new shell and content classes, and verified the change with the full suite and typecheck.

47. Added a separate multi-survey container integration test.
    Extended container preparation to seed two distinct deployed surveys, added a standalone `npm run test:integration` Docker workflow that verifies both survey pages and report counts updating independently as answers are stored, and kept the full suite and typecheck green alongside the new integration coverage.

48. Changed free-text report output to plain counted lists.
    Updated the reporter HTML renderer so free-text answers are listed without visual percentage bars and instead show only the distinct answer text plus a count, added HTML feature coverage for the new output, and verified the change with the full suite and typecheck.

49. Rendered correctness summaries in the reporter HTML page.
    Added correctness blocks to the reporter HTML output for questions that define correct answers, extended the HTML feature coverage to lock in the visible correct and incorrect counts and percentages, and verified the change with the full suite and typecheck.

50. Added a seeded visual correctness showcase container.
    Created a dedicated visual preparation path and Docker-backed `npm run test:visual` workflow that serves a seeded scored survey with prefilled answer files, verifies the report exposes correctness summaries, and leaves the container running for manual visual inspection of the survey and report pages.

51. Added an SSH installer for remote-home VPS deployments.
    Implemented a test-covered SSH install plan builder and `npm run install:ssh` CLI that prepares local assets, uploads the public tree and seed survey JSON files into paths under the remote home directory, documents the remote-home assumption in the VPS deployment guide, and verified the change with the full suite and typecheck.

52. Added validated deployment target configuration parsing.
    Defined a shared target configuration parser for `ssh` and `container` targets, sourced the target name from the surrounding target directory, defaulted `protectionFile` and `createMissingSubpaths`, added behavior coverage for both target types plus missing target-specific fields, and verified the change with the full suite and typecheck.

53. Added workspace loading for deployment targets and their surveys.
    Implemented `targets/<target-name>/target.json` loading from the workspace, discovered per-target survey directories under `targets/<target-name>/surveys/`, returned the standard `survey.json` and `template.html` paths for each survey, covered successful loading plus missing `target.json`, and verified the change with the full suite and typecheck.

54. Added reusable deployment-path parsing for the `/./` split rule.
    Implemented a shared parser that separates the pre-existing root from the deploy-creatable subpath, preserves full paths without a split marker, rejects multiple `/./` markers and empty right-hand subpaths, covered that behavior in feature tests, and verified the change with the full suite and typecheck.

55. Defined the generated target-settings contract for production assets.
    Added one shared generated-settings shape for per-survey HTML output plus injected saver and reporter CGI runtime settings, kept survey form actions aligned with the configured saver URL, preserved configured data paths as written, covered the resulting settings object in feature tests, and verified the change with the full suite and typecheck.

56. Switched container asset preparation to discovered target surveys.
    Added a sample target under `targets/sample`, mapped discovered surveys into deployable public HTML outputs through a tested helper, replaced the hard-coded survey list in `prepare-container-assets` with target-backed survey discovery, verified the prep command directly, and kept the full suite and typecheck green.

57. Switched generated survey pages to target-backed HTML settings.
    Updated container asset preparation to drive generated survey filenames and form actions from the shared generated target settings, verified the prepared survey HTML includes the target-configured saver URL, and kept the full suite and typecheck green.

58. Switched generated CGI assets to injected target runtime settings.
    Added target-based saver and reporter CGI asset preparation helpers, injected configured data directories into the generated CGI scripts, introduced explicit runtime-dir helpers so saver and reporter logic no longer depend on `HOME` when paths are injected, copied target configs into the container build, aligned the sample target data root with the container runtime, and verified the change with feature coverage, the full suite, typecheck, and the Docker-backed container test.

59. Refactored container preparation to accept a target name.
    Added a reusable target-name CLI argument reader, updated `prepare-container-assets` to accept a target name with `sample` as the compatibility default instead of always hard-coding one target, verified the explicit `npm run prepare:container -- sample` path, and kept the full suite and typecheck green.

60. Switched container image assembly to generated target settings.
    Added a generated container-target manifest plus a runtime-data installer, updated the Dockerfile to prepare one target explicitly and seed its runtime data from the generated manifest instead of hard-coded paths, preserved fallback behavior for non-targeted visual builds, and verified the change with the full suite, typecheck, and both Docker-backed container flows.

61. Switched SSH installation to target-backed deployment paths.
    Reworked the SSH install plan and CLI around loaded SSH targets instead of raw install arguments, applied `/./` path splitting to configured public, CGI, data, and protection-file destinations, copied public pages, CGI scripts, survey JSON seeds, and the local protection secret into their configured remote locations, updated the VPS deployment docs to match the new target-based workflow, and verified the change with SSH feature coverage plus the full suite and typecheck.

62. Switched visual testing to the sample target surveys.
    Added `visual-showcase` under `targets/sample`, updated `prepare:visual` to load that survey and the target-backed CGI asset settings from the sample target instead of the old docs example, kept seeded answers and runtime data manifest generation intact, and verified the change with the full suite, typecheck, and the Docker-backed visual test.

63. Documented the currently supported `target.json` contents from implementation.
    Added `docs/deployment-.targets.md` based only on the zod deployment-target schema plus the code that loads and consumes it, called out strict-key validation and defaults, and distinguished fields actively used by container prep and SSH installation from fields that are only parsed today.

64. Specified the deployment-v2 target contract and canonical layout.
    Replaced `docs/deployment-targets.md` with a v2 `target.json` contract covering target-wide roots, URLs, Node executable, CGI extension, and target-type-specific fields, and aligned it with one canonical per-survey public, CGI, and private-data layout.

65. Wrote a concise deployment-v2 implementation plan.
    Added `docs/deployment-v2-implementation-plan.md` as an ordered implementation sequence covering the new target contract, per-survey artifact layout, CGI runtime path resolution from `SCRIPT_FILENAME`, tarball packaging, setup behavior, container alignment, and the portability test coverage still required.

66. Removed reporter protection handling from the production runtime.
    Dropped survey-level `protected` handling from the schema-normalization and reporter-survey runtime flow, removed the protected-reporter feature coverage, added compatibility coverage showing legacy `protected` metadata is ignored, and verified the change with the full suite.

67. Removed reporter protection handling from build and deployment code.
    Stopped generating reporter protection secrets, removed secret injection from prepared reporter CGI assets, removed secret-copy behavior from SSH installation and visual/container preparation outputs, deleted the obsolete protection-secret feature coverage, and verified the change with targeted deployment tests plus the full suite and typecheck.

68. Removed `/./` split-path behavior from the shared deployment-path parser.
    Reworked deployment-path feature coverage to treat `/./` as plain path text, simplified `parseDeploymentPath()` to return configured paths unchanged, and verified the change with parser-focused feature coverage and typecheck.

69. Removed `/./` split-path and directory-creation behavior from deployment planning.
    Simplified the SSH install plan to preserve configured target paths literally, removed the pre-copy SSH setup command and the remaining `/./`-aware path handling, and verified the change with SSH install coverage plus the full suite and typecheck.

70. Switched target parsing to the deployment-v2 config schema.
    Replaced the old target configuration fields with `publicDir`, `cgiDir`, `cgiBaseUrl`, `nodeExecutable`, and `cgiExtension`, updated parser/discovery/settings/SSH fixtures to the new contract, derived the temporary save form action from `cgiBaseUrl` plus `cgiExtension`, and verified the change with parser-focused coverage, the full suite, and typecheck.

71. Switched generated target settings to per-survey deployment settings.
    Replaced the old shared target-level manifest shape with one `surveys[]` array describing each survey's public directory and URL, CGI directory and URLs, and private data paths, updated container and visual preparation to consume those per-survey settings while temporarily deriving shared CGI runtime placeholders locally, adjusted container runtime-data installation to seed each survey's private paths from the new manifest, and verified the change with targeted generated-settings coverage, the full suite, and typecheck.

72. Switched generated survey HTML and CGI asset helpers to per-survey URLs and private paths.
    Updated generated survey pages to use the configured per-survey save URL directly instead of appending `surveyName`, taught saver and reporter CGI asset preparation to inject direct per-survey private survey and answers paths plus the configured survey name, kept the old shared-root replacement path only as a temporary compatibility branch for current prep commands, and verified the change with targeted HTML/CGI asset coverage, the full suite, and typecheck.
