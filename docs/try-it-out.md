# Try It Out

## Generate a survey page

Generate a standalone HTML page from the sample survey:

```bash
npm run generate -- targets/sample/surveys/survey/survey.json targets/sample/surveys/survey/template.html survey.html https://example.test/cgi-bin/survey/save.cgi
```

Open `survey.html` in a browser to inspect the result.

## Simulate saver submission

The `manual:save` helper exercises the saver path without a CGI wrapper.

Save one answer into a workspace-local home directory:

```bash
npm run manual:save -- targets/sample/surveys/survey/survey.json 'favorite-color=blue&notes=Manual+note' .manual-home
```

The command prints the saved answer file path. Inspect it under:

```text
.manual-home/.local/share/associative-survey/answers/survey/
```

Override the respondent id if needed:

```bash
MANUAL_RESPONDENT_ID=abcdefabcdefabcdefabcdefabcdefab npm run manual:save -- targets/sample/surveys/survey/survey.json 'favorite-color=red' .manual-home
```

## Run the automated checks

```bash
npm test
npm run check
```

## Run the container and answer the packaged survey

See `docs/deployment.md` for the full container deployment walkthrough using `targets/sample`.

## Use the automated container test

```bash
npm run test:container
```

Builds the image, runs the container, submits one answer, and verifies the report shows one respondent.

For manual visual verification:

```bash
npm run test:visual
```

Starts a seeded showcase container and prints the survey URL, report URL, and stop command.
