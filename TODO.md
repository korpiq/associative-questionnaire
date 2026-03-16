# TODO

- Add feature coverage for generator output that includes a submit button, configurable form action, and derived `surveyName`.

- Implement derived `surveyName` handling from the questionnaire JSON filename and carry it through generated output.
  The generated page should expose `surveyName` for later CGI and reporter use.

- Add generator support for a submit button, configurable form action URL, and hidden submission metadata for `surveyName` and questionnaire title.
  Keep the default generated page self-contained and ready to post directly to the shared CGI saver.

- Extend the questionnaire schema and normalization flow to support optional survey-level metadata needed by deployment and reporting.
  Include at least `protected: true` support for surveys whose reports require access control.

- Extend the saved answer schema to store `surveyName` alongside `questionnaireTitle`.
  This keeps reporter lookup stable even if a title changes later.

- Add feature coverage for CGI request normalization from browser form fields into the saved answer schema.
  Cover single-choice, multi-choice, free-text, associative answers, and the derived `surveyName`.

- Implement CGI request parsing and normalization for `application/x-www-form-urlencoded` submissions.
  It should transform browser form fields into the validated saved answer structure.

- Implement CGI answer validation and respondent file naming.
  Use the shared answer schema and compute one-way hashed filenames from the selected request headers.

- Implement CGI runtime storage creation under the effective user home directory.
  It should create the runtime answers root and per-`surveyName` directories on demand.

- Implement CGI answer persistence for all surveys through one shared endpoint.
  Repeated submissions from the same respondent key should replace the existing answer file for that survey.

- Add feature coverage for CGI HTML responses and customization parameters.
  Cover built-in success and failure pages, optional success and failure redirects, and optional CSS override for built-in pages.

- Implement CGI HTML success and failure responses with optional redirect and CSS overrides.
  The CGI should never need to return JSON.

- Add feature coverage for reporter survey resolution and answer loading by `surveyName`.
  The reporter should depend on the caller to provide the correct survey name and should read public survey definitions plus stored answers for that survey.

- Implement reporter survey resolution from public definitions and runtime answer directories.
  It should validate the survey JSON and each answer file before reporting.

- Implement reporter totals and per-question statistics.
  Start with counts and percentages using the validated survey definition and saved answers.

- Implement reporter grouped statistics parameters.
  Support caller-provided grouping inputs such as grouped-by question identifiers and optional recipient counts.

- Implement reporter HTML output as a CGI page.
  Render one survey report page per requested `surveyName`.

- Implement reporter graphics in the HTML report page.
  Present the calculated survey statistics with clear visual summaries.

- Add deployment-time support for reporter protection secrets.
  Generate a secret during deployment, inject it into the reporter CGI script, and store it locally in the deployment workspace.

- Implement protected survey reporting.
  If a survey JSON specifies `protected: true`, require the reporter CGI to also receive a hash of `surveyName` computed with the embedded secret before showing results.

- Document VPS deployment for generated survey pages, public definitions, CGI scripts, runtime answer storage, and protected reporter secrets.

- Generate a Dockerfile that builds a container containing everything required to serve a survey.
  It should include static survey pages, public survey definitions, the CGI saver, the CGI reporter, protected-reporter secret injection support, and the runtime directory setup needed for saved answers.
  Add an automated end-to-end container test that builds and runs the container, submits answers to a survey inside it, and verifies the report output.

- Rework Gherkin scenarios to avoid repeated step text where the parser rejects repetition.
  Prefer clearer scenario structure over repeated identical lines once the current implementation work is stable.
