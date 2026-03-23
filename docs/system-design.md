# System design

## Purpose

This document defines how the generated survey pages, the shared CGI saver, and the reporter work together as one deployable system.

The design targets two deployment styles:

- a VPS-style Linux server where files are copied in via `ssh`
- a container image running the same file layout behind a web server

## Goals

- Serve one or more standalone survey HTML pages at the same time.
- Allow additional survey pages to be deployed later without changing the CGI entrypoint.
- Allow old survey pages to be removed without disturbing saved answers of other surveys.
- Use one shared CGI script to receive submissions from all survey pages.
- Use one reporter command to show statistics for a named survey.
- Keep survey definitions stored server-side for the reporter without exposing them publicly.
- Let the CGI create its own runtime data directories under the effective user home directory visible to the web server process.

## Non-goals

- Multi-user administration UI.
- Database-backed storage.
- Real-time reporting.
- Cross-host synchronization of answer files.

## Components

### 1. Generator

Inputs:

- survey JSON
- HTML template
- submit target URL

Outputs:

- one standalone HTML page per survey

Responsibilities:

- validate survey JSON with the existing schema
- render the survey into a self-contained HTML page
- include a submit button
- set the form submission target URL so the page can post to the shared CGI saver
- submit only answer fields in the native browser form encoding

### 2. Shared CGI saver

Input:

- form submissions from any generated survey page

Output:

- one JSON answer file per logical respondent per survey
- one JSON answer file per logical respondent cookie per survey

Responsibilities:

- accept submissions for all deployed surveys through one endpoint
- validate the incoming answer payload against the same answer schema used elsewhere in the project
- resolve the target survey storage directory
- create missing runtime directories under the CGI process home directory
- write or replace the answer JSON file for that respondent cookie id
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
- stored survey JSON definition
- stored answer JSON files for that survey

Output:

- statistics for the named survey

Responsibilities:

- load the survey definition for the requested survey
- load and validate all answer files for that survey
- calculate counts, percentages, grouped statistics, correctness statistics, and later graphs
- report invalid or unreadable answer files clearly
- accept survey JSON uploads via POST so a survey definition can be created or updated without making the JSON file public

Implementation target:

- TypeScript/Node.js program exposed as a web/CGI report page

## Deployment model

The deployed system separates static assets from runtime data.

### Static deployed files

These files are copied during deployment and may be replaced or removed later:

- generated survey HTML pages
- the shared CGI script
- the reporter program and its support files

### Runtime data

These files are created by the CGI at runtime and must not depend on the deploy path being writable:

- stored survey JSON files
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
    surveys/
      team-fit.html
      onboarding.html
    cgi-bin/
      save-survey.js
      report-survey.js
```

Notes:

- `public/surveys/` holds the generated standalone pages.
- `public/cgi-bin/` holds the shared CGI entrypoint.
- `public/cgi-bin/report-survey.js` is the shared web/CGI reporter entrypoint.

### Runtime data tree

Example under the CGI user home directory:

```text
~/.local/share/associative-survey/
  surveys/
    team-fit.json
    onboarding.json
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
- it keeps survey JSON files off the public web root
- it keeps answer files grouped by survey name

## Survey identity

The system needs one stable identifier shared by generator output, CGI storage, and reporter lookup.

Proposed identifier:

- `surveyName`

Properties:

- deployment-safe token, separate from the human-readable title
- derived from the survey JSON filename without the `.json` suffix
- used for the generated HTML filename
- used for the answer subdirectory name
- used as the reporter lookup argument

This avoids adding a separate name field to the survey schema.

## Survey definition schema

Survey JSON continues to define the survey structure and content.

Required and optional survey-level fields:

- title
- optional description
- optional `protected: true`
- sections

Question-level correctness support:

- any question may optionally define correct answers
- questions without correct answers are still valid and report only response statistics
- questions with correct answers also report correct and incorrect answer counts and percentages

Expected correctness shapes:

- single-choice: one correct option id
- multi-choice: one exact set of correct option ids
- free-text: optional list of accepted exact answers or normalized answers
- associative: exact set of correct left/right pairs

The exact schema shape should be finalized in implementation and tests, but correctness must be optional per question.

## Submission flow

1. A user opens a generated survey HTML page.
2. The page renders the survey and includes a submit button.
3. The form posts to the configured CGI URL.
4. The submission includes:
   - answer fields only
5. The CGI validates the payload.
6. On the first successful save, the CGI generates a random respondent cookie id and returns it in `Set-Cookie`.
7. On later saves, the CGI reuses the existing respondent cookie id from the browser request.
8. The CGI creates `~/.local/share/associative-survey/answers/<surveyName>/` if needed.
9. The CGI writes one JSON file for that respondent cookie id.
10. The CGI returns a built-in HTML page or redirects to a configured HTML page.

## CGI response customization

The CGI should support simple HTML response customization without requiring JavaScript clients.

Optional request query parameters (URLs):

- `ok`
- `fail`
- `css`

Behavior:

- if `ok` is provided, successful submissions redirect there instead of showing the built-in success page
- if `fail` is provided, failed submissions redirect there instead of showing the built-in failure page
- if no redirect override is provided, the CGI serves its own built-in HTML page
- if `css` is provided and the CGI serves a built-in page, that page links to the custom stylesheet

## Submission payload

The browser form should submit `application/x-www-form-urlencoded`, which fits CGI well and works without extra client dependencies.

The POST body sent to the CGI saver should contain only the answer fields in the native format produced by the browser form.

The survey identity is resolved by the CGI from the request target, such as the saver CGI path or query string configured into the generated survey page.

Answer encoding by question type:

- single-choice: selected value
- multi-choice: repeated values collected into an array by the CGI
- free-text: plain string
- associative: hidden input already carrying JSON for the left/right pairs

The CGI should normalize the form fields into the saved answer schema before validation and storage.

## Saved answer file format

Saved answers should continue to follow the existing schema:

```json
{
  "surveyTitle": "Example title",
  "answers": {
    "favorite-color": { "type": "single-choice", "value": "red" },
    "hobbies": { "type": "multi-choice", "value": ["music"] },
    "notes": { "type": "free-text", "value": "Example note" },
    "matches": { "type": "associative", "value": [{ "left": "1", "right": "A" }] }
  }
}
```

Recommended addition:

- store `surveyName` alongside `surveyTitle` in the answer file

Reason:

- titles may change over time, but storage lookup should remain stable

This is another pending schema change.

## Respondent file naming

The saver identifies repeat submissions through a cookie set by the CGI.

Behavior:

- if the request already includes a valid respondent cookie, reuse its value
- otherwise generate a pseudorandom 32-character lowercase hex id
- on the first successful save, return that id in `Set-Cookie`
- set the cookie lifetime to one month
- use the cookie value as the answer filename stem
- write to `<respondent-cookie-id>.json`

Result:

- repeat submissions from the same browser cookie replace the same file
- a browser without that cookie gets a different file

## Reporter flow

1. Operator opens the reporter page with the desired `surveyName`.
2. Reporter resolves the stored survey JSON from `~/.local/share/associative-survey/surveys/<surveyName>.json`.
3. Reporter resolves `~/.local/share/associative-survey/answers/<surveyName>/`.
4. Reporter validates the survey JSON.
5. Reporter validates each answer file.
6. Reporter computes totals, per-question breakdowns, correctness statistics for questions that define correct answers, optional grouped statistics, and later graphs.
7. Reporter renders an HTML report page with statistics and graphics.

## Reporter survey upload flow

The reporter is also responsible for receiving survey JSON definitions by POST.

Upload behavior:

1. Caller sends a survey JSON file to the reporter CGI by POST.
2. Reporter derives `surveyName` from the uploaded filename.
3. Reporter validates the survey JSON.
4. Reporter creates `~/.local/share/associative-survey/surveys/` if needed.
5. If no stored survey exists yet, reporter saves the uploaded survey JSON.
6. If a stored survey already exists and it is not protected, reporter replaces it with the uploaded survey JSON.
7. If a stored survey already exists and it has `protected: true`, the caller must also provide a valid protection hash before replacement is allowed.

Protection hash:

- format: lowercase hex SHA-256 of `surveyName + secret`
- the secret is generated at deploy time
- the secret is embedded into the reporter CGI script
- the secret is also stored locally in the deployment workspace

## Reporter interfaces

Minimum endpoint:

```text
/cgi-bin/report-survey.js?surveyName=<surveyName>
```

The reporter depends on the caller to provide the correct `surveyName`.

Useful future flags:

- `surveyName`
- `groupBy`
- `recipientCount`
- `ignoreAnswer`
- `hash`

Default lookup behavior:

- survey JSON definitions from the runtime data directory under the current user home
- answers from the runtime data directory under the current user home

## Web server expectations

The design assumes:

- the web server can serve static survey HTML files
- the web server can execute the shared CGI script
- the CGI process has a writable home directory

The design does not require:

- write access to the static deploy tree
- a database
- a persistent application server beyond CGI

## Container notes

In container deployments:

- mount the runtime data directory as a volume
- mount or bake in the static survey pages, CGI saver, and CGI reporter
- ensure the container user running CGI has a writable home directory

Recommended runtime mount:

- `/home/app/.local/share/associative-survey`

## VPS notes

In VPS deployments:

- deploy static files by `ssh` to the web-served application tree
- do not assume that tree is writable by the CGI user
- let the CGI create its own runtime data tree under its visible home directory on first submission

## Implementation status

Use `TODO.md` as the authoritative ordered implementation plan for the remaining generator, CGI saver, reporter, deployment, and packaging work.
