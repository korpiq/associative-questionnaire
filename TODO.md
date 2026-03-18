# TODO

- Document VPS deployment for generated survey pages, CGI scripts, runtime survey storage, runtime answer storage, and protected reporter secrets.

- Generate a Dockerfile that builds a container containing everything required to serve a survey.
  It should include static survey pages, the CGI saver, the CGI reporter, protected-reporter secret injection support, and the runtime directory setup needed for stored survey JSON plus saved answers.
  Add an automated end-to-end container test that builds and runs the container, submits answers to a survey inside it, and verifies the report output.

- Rework Gherkin scenarios to avoid repeated step text where the parser rejects repetition.
  Prefer clearer scenario structure over repeated identical lines once the current implementation work is stable. Make it easier to understand by short, descriptive Scenario titles.
