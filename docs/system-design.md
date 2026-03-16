# System design

## Purpose

This document defines how the generated questionnaire pages, the shared CGI saver, and the reporter work together as one deployable system.

The design targets two deployment styles:

- a VPS-style Linux server where files are copied in via `ssh`
- a container image running the same file layout behind a web server

## Goals

- Serve one or more standalone questionnaire HTML pages at the same time.
- Allow additional questionnaire pages to be deployed later without changing the CGI entrypoint.
- Allow old questionnaire pages to be removed without disturbing saved answers of other questionnaires.
- Use one shared CGI script to receive submissions from all questionnaire pages.
- Use one reporter command to show statistics for a named survey.
- Keep survey definitions available to the reporter alongside collected answers.
- Let the CGI create its own runtime data directories under the effective user home directory visible to the web server process.

## Non-goals

- Multi-user administration UI.
- Database-backed storage.
- Real-time reporting.
- Cross-host synchronization of answer files.

## Components

### 1. Generator

Inputs:

- questionnaire JSON
- HTML template
- submit target URL

Outputs:

- one standalone HTML page per questionnaire

Responsibilities:

- validate questionnaire JSON with the existing schema
- render the questionnaire into a self-contained HTML page
- include a submit button
- set the form submission target URL so the page can post to the shared CGI saver
- include the derived `surveyName` in the generated page so the CGI and reporter can resolve the right files

### 2. Shared CGI saver

Input:

- form submissions from any generated questionnaire page

Output:

- one JSON answer file per logical respondent per questionnaire

Responsibilities:

- accept submissions for all deployed questionnaires through one endpoint
- validate the incoming answer payload against the same answer schema used elsewhere in the project
- resolve the target questionnaire storage directory
- create missing runtime directories under the CGI process home directory
- write or replace the answer JSON file for that respondent key
- return an HTML success or failure response suitable for simple browser form submission

Implementation constraint:

- plain JavaScript CGI script

Response model:

- the CGI returns HTML pages, not JSON
- the default behavior is a built-in success page or failure page
- optional request parameters may override those defaults with redirect targets
- optional request parameters may provide a CSS URL for the built-in CGI pages

### 3. Reporter

Input:

- survey name (`surveyName`)
- questionnaire JSON definition
- stored answer JSON files for that survey

Output:

- statistics for the named survey

Responsibilities:

- load the questionnaire definition for the requested survey
- load and validate all answer files for that survey
- calculate counts, percentages, grouped statistics, and later graphs
- report invalid or unreadable answer files clearly

Implementation target:

- TypeScript/Node.js program exposed as a web/CGI report page

## Deployment model

The deployed system separates static assets from runtime data.

### Static deployed files

These files are copied during deployment and may be replaced or removed later:

- generated questionnaire HTML pages
- the shared CGI script
- survey JSON definitions used by the reporter
- the reporter program and its support files

### Runtime data

These files are created by the CGI at runtime and must not depend on the deploy path being writable:

- answer JSON files
- runtime-created survey answer directories

The CGI must create runtime data under the effective home directory of the web-server-visible user, not under the deployment directory.

## Proposed filesystem layout

This layout is intended to work both on a VPS and in a container.

### Static application tree

Example:

```text
app/
  public/
    questionnaires/
      team-fit.html
      onboarding.html
    definitions/
      team-fit.json
      onboarding.json
    cgi-bin/
      save-questionnaire.js
      report-questionnaire.js
```

Notes:

- `public/questionnaires/` holds the generated standalone pages.
- `public/definitions/` holds the survey JSON files and keeps them easy for the reporter to resolve.
- `public/cgi-bin/` holds the shared CGI entrypoint.
- `public/cgi-bin/report-questionnaire.js` is the shared web/CGI reporter entrypoint.

### Runtime data tree

Example under the CGI user home directory:

```text
~/.local/share/associative-questionnaire/
  answers/
    team-fit/
      4d4c0c....json
      85b61a....json
    onboarding/
      0ef203....json
```

Why this layout:

- it works when the deployed application directory is read-only
- it avoids assuming the `ssh` deploy user home matches the web server process home
- it keeps answer files grouped by survey name

## Survey identity

The system needs one stable identifier shared by generator output, CGI storage, and reporter lookup.

Proposed identifier:

- `surveyName`

Properties:

- deployment-safe token, separate from the human-readable title
- derived from the questionnaire JSON filename without the `.json` suffix
- used for the generated HTML filename
- used for the answer subdirectory name
- used as the reporter lookup argument

This avoids adding a separate name field to the questionnaire schema.

## Submission flow

1. A user opens a generated questionnaire HTML page.
2. The page renders the questionnaire and includes a submit button.
3. The form posts to the configured CGI URL.
4. The submission includes:
   - survey name (`surveyName`)
   - questionnaire title
   - answers keyed by question id
5. The CGI validates the payload.
6. The CGI computes a respondent file key from selected request headers.
7. The CGI creates `~/.local/share/associative-questionnaire/answers/<surveyName>/` if needed.
8. The CGI writes one JSON file for that respondent key.
9. The CGI returns a built-in HTML page or redirects to a configured HTML page.

## CGI response customization

The CGI should support simple HTML response customization without requiring JavaScript clients.

Optional request parameters:

- success redirect URL
- failure redirect URL
- CSS URL for the built-in CGI pages

Behavior:

- if a success redirect URL is provided, successful submissions redirect there instead of showing the built-in success page
- if a failure redirect URL is provided, failed submissions redirect there instead of showing the built-in failure page
- if no redirect override is provided, the CGI serves its own built-in HTML page
- if a CSS URL is provided and the CGI serves a built-in page, that page links to the custom stylesheet

## Submission payload

The browser form should submit `application/x-www-form-urlencoded`, which fits CGI well and works without extra client dependencies.

The generator should emit hidden fields for:

- `surveyName`
- `questionnaireTitle`

Answer encoding by question type:

- single-choice: selected value
- multi-choice: repeated values collected into an array by the CGI
- free-text: plain string
- associative: hidden input already carrying JSON for the left/right pairs

The CGI should normalize the form fields into the existing `answerFileSchema` shape before validation and storage.

## Saved answer file format

Saved answers should continue to follow the existing schema:

```json
{
  "questionnaireTitle": "Example title",
  "answers": {
    "favorite-color": { "type": "single-choice", "value": "red" },
    "hobbies": { "type": "multi-choice", "value": ["music"] },
    "notes": { "type": "free-text", "value": "Example note" },
    "matches": { "type": "associative", "value": [{ "left": "1", "right": "A" }] }
  }
}
```

Recommended addition:

- store `surveyName` alongside `questionnaireTitle` in the answer file

Reason:

- titles may change over time, but storage lookup should remain stable

This is another pending schema change.

## Respondent file naming

The current project contract already says the filename should be a one-way hash of identifying request headers.

Proposed input material:

- `REMOTE_ADDR`
- `HTTP_USER_AGENT`
- `HTTP_ACCEPT_LANGUAGE`
- optionally a deployment-specific salt read from environment

Proposed behavior:

- hash the selected values with SHA-256
- use the hex digest as the filename stem
- write to `<hash>.json`

Result:

- repeat submissions from the same apparent browser/device replace the same file
- submissions from different devices or materially different headers create separate files

## Reporter flow

1. Operator opens the reporter page with the desired `surveyName`.
2. Reporter resolves `public/definitions/<surveyName>.json`.
3. Reporter resolves `~/.local/share/associative-questionnaire/answers/<surveyName>/`.
4. Reporter validates the questionnaire JSON.
5. Reporter validates each answer file.
6. Reporter computes totals, per-question breakdowns, optional grouped statistics, and later graphs.
7. Reporter renders an HTML report page with statistics and graphics.

## Reporter interfaces

Minimum endpoint:

```text
/cgi-bin/report-questionnaire.js?surveyName=<surveyName>
```

The reporter depends on the caller to provide the correct `surveyName`.

Useful future flags:

- `surveyName`
- `groupBy`
- `recipientCount`
- `ignoreAnswer`

Default lookup behavior:

- definitions from the deployed public definitions directory
- answers from the runtime data directory under the current user home

## Web server expectations

The design assumes:

- the web server can serve static questionnaire HTML files
- the web server can execute the shared CGI script
- the CGI process has a writable home directory

The design does not require:

- write access to the static deploy tree
- a database
- a persistent application server beyond CGI

## Container notes

In container deployments:

- mount the runtime data directory as a volume
- mount or bake in the static questionnaire pages, public definitions, CGI saver, and CGI reporter
- ensure the container user running CGI has a writable home directory

Recommended runtime mount:

- `/home/app/.local/share/associative-questionnaire/answers`

## VPS notes

In VPS deployments:

- deploy static files by `ssh` to the web-served application tree
- do not assume that tree is writable by the CGI user
- let the CGI create its own runtime data tree under its visible home directory on first submission

## Implementation status

Use `TODO.md` as the authoritative ordered implementation plan for the remaining generator, CGI saver, reporter, deployment, and packaging work.
