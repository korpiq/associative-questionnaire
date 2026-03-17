# TODO

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
