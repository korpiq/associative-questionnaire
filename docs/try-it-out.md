# Try It Out

This project includes a runnable local saver path and a deployable container path from the repository root.

## Generate a survey page

Generate the basic example HTML:

```bash
npm run generate -- docs/examples/basic/survey.json docs/examples/basic/template.html associative-survey-example.html https://example.test/cgi-bin/save-survey.js
```

Generate the snippet override example HTML:

```bash
npm run generate -- docs/examples/snippet-overrides/survey.json docs/examples/snippet-overrides/template.html associative-survey-snippet-overrides.html https://example.test/cgi-bin/save-survey.js
```

What to check in the generated HTML:

- the page contains a submit button
- the form method is `post`
- the form action includes the derived `surveyName`
- associative linking still works in the browser

## Simulate saver submission

The `manual:save` helper exercises the current saver path without needing a CGI wrapper yet.

Save one answer into a workspace-local home directory:

```bash
npm run manual:save -- docs/examples/basic/survey.json 'favorite-color=blue&notes=Manual+note' .manual-home
```

The command prints JSON containing the saved answer file path:

```json
{
  "savedAnswerFilePath": "/abs/path/to/.manual-home/.local/share/associative-survey/answers/survey/<hash>.json"
}
```

Inspect the saved answer file under:

```text
.manual-home/.local/share/associative-survey/answers/survey/
```

The default manual helper respondent id is:

- `0123456789abcdef0123456789abcdef`

Override them if needed:

```bash
MANUAL_RESPONDENT_ID=abcdefabcdefabcdefabcdefabcdefab npm run manual:save -- docs/examples/basic/survey.json 'favorite-color=red&notes=Other+client' .manual-home
```

## Verify replacement behavior

Run the helper twice with the same home directory and same respondent id, but a different request body:

```bash
npm run manual:save -- docs/examples/basic/survey.json 'favorite-color=red&notes=First+note' .manual-home
```

```bash
npm run manual:save -- docs/examples/basic/survey.json 'favorite-color=blue&notes=Updated+note' .manual-home
```

The reported path should stay the same, and the JSON file content should reflect the second submission.

## Run the automated checks

```bash
npm test
npm run check
```

## Run the container and answer the seeded survey

Build the current image:

```bash
npm run build
npm run prepare:container
docker build -t associative-survey:test .
```

Run the container:

```bash
docker rm -f associative-survey-local >/dev/null 2>&1 || true
docker run -d --name associative-survey-local -p 18080:8080 associative-survey:test
```

Open the seeded survey page in a browser:

```text
http://127.0.0.1:18080/surveys/survey.html
```

Fill in some answers and submit the form. The seeded survey is stored as `survey`, so the built-in report URL is:

```text
http://127.0.0.1:18080/cgi-bin/report-survey.js?surveyName=survey
```

Open that report URL in the browser after submitting. You should see:

- the survey title
- `Respondents: 1` after one submission
- per-question counts and percentages
- visual percentage bars

## Submit to the container without a browser

If you want a quick non-interactive check, submit one response with `curl`:

```bash
curl --fail --silent --show-error \
  -X POST \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data 'favorite-color=blue&notes=Container+note&matches=%5B%7B%22left%22%3A%221%22%2C%22right%22%3A%22A%22%7D%5D' \
  'http://127.0.0.1:18080/cgi-bin/save-survey.js?surveyName=survey'
```

Then fetch the report:

```bash
curl --fail --silent 'http://127.0.0.1:18080/cgi-bin/report-survey.js?surveyName=survey'
```

## Use the automated container test

The repository also includes an end-to-end container test:

```bash
npm run test:container
```

That command builds the image, runs the container, submits one answer, and verifies that the report shows one respondent.

There is also a broader integration test that seeds two surveys into one container and checks that each report updates independently as more answers are submitted:

```bash
npm run test:integration
```

For manual visual verification of correctness reporting across question types, start the seeded showcase container:

```bash
npm run test:visual
```

That command builds a dedicated image, starts a container with prefilled answers, verifies the report is reachable, and prints the survey URL, report URL, and stop command. It leaves the container running for inspection.

## Stop the container

```bash
docker rm -f associative-survey-local
```
