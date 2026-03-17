# TODO

- Extend the survey schema to support optional correct answers on any question type.
  Questions with correct answers should later report correct and incorrect answer counts and percentages, while questions without them should not.

- Add feature coverage for generator output that includes a submit button, configurable form action, and derived `surveyName`.

- Implement derived `surveyName` handling from the survey JSON filename and carry it through generated output.
  The generated page should know which survey it belongs to without adding an explicit `surveyName` field to the JSON schema.

- Add generator support for a submit button and configurable form action URL.
  Keep the default generated page self-contained and ready to post directly to the shared CGI saver using native browser form encoding.

- Add feature coverage for CGI request normalization from browser form fields into the saved answer schema.
  Cover single-choice, multi-choice, free-text, associative answers, and survey resolution without extra answer metadata in the POST body.

- Implement CGI request parsing and normalization for `application/x-www-form-urlencoded` submissions.
  It should transform browser form fields into the validated saved answer structure.

- Implement CGI answer validation and respondent file naming.
  Use the shared answer schema and compute one-way hashed filenames from the selected request headers.

- Implement CGI runtime storage creation under the effective user home directory.
  It should create the runtime answers root and per-`surveyName` directories on demand.

- Implement CGI answer persistence for all surveys through one shared endpoint.
  Repeated submissions from the same respondent key should replace the existing answer file for that survey.

- Add feature coverage for CGI HTML responses and customization parameters.
  Cover built-in success and failure pages plus the `ok` (redirect url on success), `fail` (redirect url on failure), and `css` (extra CSS file url) CGI parameters.

- Implement CGI HTML success and failure responses with optional redirect and CSS overrides.
  The CGI should never need to return JSON.

- Add feature coverage for reporter survey upload and stored survey resolution by `surveyName`.
  The reporter should accept survey JSON uploads by POST, derive `surveyName` from the uploaded filename, and later resolve stored surveys plus answers for that survey.

- Implement reporter survey upload and storage.
  It should validate uploaded survey JSON, create the runtime survey directory on demand, and store the survey JSON outside the public web root.

- Add deployment-time support for reporter protection secrets.
  Generate a secret during deployment, inject it into the reporter CGI script, and store it locally in the deployment workspace.

- Add feature coverage for protected survey upload and protected survey reporting.
  If a stored survey has `protected: true`, require a lowercase hex `sha256(surveyName + secret)` hash before allowing replacement or showing the report.

- Implement protected survey upload and protected survey reporting.
  Enforce the `hash` parameter for protected surveys when uploading a replacement survey JSON or showing its report.

- Implement reporter survey resolution from stored survey JSON and runtime answer directories.
  It should validate the survey JSON and each answer file before reporting.

- Implement reporter totals and per-question statistics.
  Start with counts and percentages using the validated survey definition and saved answers.

- Implement reporter correctness statistics for questions that define correct answers.
  Show correct and incorrect answer counts and percentages only for questions that provide correct answers.

- Implement reporter grouped statistics parameters.
  Support caller-provided grouping inputs such as grouped-by question identifiers and optional recipient counts.

- Implement reporter HTML output as a CGI page.
  Render one survey report page per requested `surveyName`.

- Implement reporter graphics in the HTML report page.
  Present the calculated survey statistics with clear visual summaries.

- Document VPS deployment for generated survey pages, CGI scripts, runtime survey storage, runtime answer storage, and protected reporter secrets.

- Generate a Dockerfile that builds a container containing everything required to serve a survey.
  It should include static survey pages, the CGI saver, the CGI reporter, protected-reporter secret injection support, and the runtime directory setup needed for stored survey JSON plus saved answers.
  Add an automated end-to-end container test that builds and runs the container, submits answers to a survey inside it, and verifies the report output.

- Rework Gherkin scenarios to avoid repeated step text where the parser rejects repetition.
  Prefer clearer scenario structure over repeated identical lines once the current implementation work is stable.
