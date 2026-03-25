# Architecture

## Purpose

A survey system consisting of three components: a generator that produces standalone HTML survey pages, a CGI saver that stores submitted answers, and a reporter that computes statistics from stored answers.

## Goals

- Serve one or more standalone survey HTML pages from the same deployment.
- Accept answer submissions through one shared CGI endpoint.
- Store submitted answers per-survey in a private runtime directory.
- Run a reporter against stored answers for a named survey.
- Keep survey definitions server-side without exposing them publicly.
- Allow surveys to be added or removed independently.

## Non-goals

- Multi-user administration UI.
- Database-backed storage.
- Real-time reporting.
- Cross-host synchronization of answer files.

## Components

### Generator

Takes a survey JSON file and an HTML template. Produces one standalone HTML page per survey. The page includes all styles and browser-side JavaScript it needs, a form that submits answers to the shared CGI saver, and no runtime dependency on a build step or framework.

### CGI Saver

A plain JavaScript CGI script shared across all deployed surveys. Receives form submissions, validates the answer payload, identifies repeat submissions via a browser cookie, and writes one JSON answer file per respondent per survey under the CGI user's home directory.

### Reporter

A Node.js/CGI program. Given a survey name, loads the stored survey definition and answer files, computes per-question counts, percentages, grouped statistics, and correctness statistics for questions that define correct answers, and renders an HTML report.

## Filesystem Layout

The deployed system separates static files from runtime data.

### Static files (deployed, may be replaced)

```
<publicDir>/<surveyName>/
  index.html        generated survey page
  ok.html           success page shown or redirected to after submission
  fail.html         failure page shown or redirected to on error

<cgiDir>/<surveyName>/
  save.cgi          CGI saver for this survey
  report.cgi        CGI reporter for this survey
```

### Runtime data (created by CGI at runtime)

```
<dataDir>/<surveyName>/
  survey.json       stored survey definition (uploaded via reporter POST)
  answers/
    <respondent-id>.json    one file per logical respondent
```

Runtime data is written under `<dataDir>` as configured in `target.json`. The CGI creates missing directories on first use and does not require the static deploy tree to be writable.

## Deployment Styles

Two deployment styles are supported and use identical package contents:

- **SSH**: static files and CGI scripts are streamed to a VPS via `ssh tar xPzvf -`.
- **Container**: the same tarball is extracted into a running container via `docker exec -i ... tar xPzvf -`.

See `docs/deployment.md` for the packaging and deployment workflow. See `docs/configuration.md` for target configuration.

## Survey Identity

Each survey is identified by its `surveyName`, derived from the survey JSON filename without the `.json` suffix. The same token is used for:

- the generated HTML filename and public URL path
- the CGI endpoint path
- the answer storage directory name
- the reporter lookup argument

## Submission Flow

1. User opens a generated survey page and fills in answers.
2. The browser posts the form to the survey's `save.cgi` endpoint.
3. The CGI validates the payload, resolves or creates the respondent cookie, and writes the answer file.
4. The CGI returns an HTML success or failure page, or redirects to configured URLs.

## Runtime Requirements

- Web server capable of serving static files and executing CGI scripts.
- Node.js 20 on the target for CGI execution.
- A writable home directory for the web server's CGI process (for runtime data).
- No database, no persistent application server beyond CGI.
