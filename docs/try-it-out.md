# Try It Out

This project does not yet have a real CGI executable script, but you can already try the current generator and saver path from the repository root.

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

The default manual helper headers are:

- `REMOTE_ADDR=203.0.113.10`
- `HTTP_USER_AGENT=ManualSurveySaver/1.0`
- `HTTP_ACCEPT_LANGUAGE=en-US,en;q=0.9`

Override them if needed:

```bash
MANUAL_REMOTE_ADDR=198.51.100.7 MANUAL_USER_AGENT='AnotherBrowser/2.0' npm run manual:save -- docs/examples/basic/survey.json 'favorite-color=red&notes=Other+device' .manual-home
```

If you want the respondent hash to include a deployment salt:

```bash
MANUAL_DEPLOYMENT_SALT=deploy-secret npm run manual:save -- docs/examples/basic/survey.json 'favorite-color=red&notes=Salted+save' .manual-home
```

## Verify replacement behavior

Run the helper twice with the same home directory and same header values, but a different request body:

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

## Stop the container

```bash
docker rm -f associative-survey-local
```
