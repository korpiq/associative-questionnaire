# `target.json` for Deployment v2

This document specifies the `targets/<targetName>/target.json` contract for Deployment v2.

## General rules

- `targetName` is not stored in JSON. It comes from the `targets/<targetName>/` directory name.
- `target.json` contains target-level deployment settings only.
- Surveys are discovered from `targets/<targetName>/surveys/<surveyName>/`.
- The JSON object should be treated as strict. Unknown keys are configuration errors.
- All paths in this file are target-host paths unless a field is explicitly documented as a URL.

## Shape

Every `target.json` is one JSON object with:

```json
{
  "type": "ssh",
  "publicDir": "public_html/surveys",
  "cgiDir": "public_html/cgi-bin",
  "dataDir": "private/survey-data",
  "publicBaseUrl": "https://example.test/surveys",
  "cgiBaseUrl": "https://example.test/cgi-bin",
  "nodeExecutable": "/usr/local/bin/node",
  "cgiExtension": ".cgi",
  "sshTarget": "user@example.test"
}
```

Container targets use `"type": "container"` and define `containerName` instead of `sshTarget`.

## Required keys

`type`
: Required. One of:
: - `"container"`
: - `"ssh"`

`publicDir`
: Required target-host path.
: Directory where generated survey web files are deployed.
: This directory is webserver-visible.

`cgiDir`
: Required target-host path.
: Directory where generated CGI executables are deployed.
: This directory must be executable by the web server.

`dataDir`
: Required target-host path.
: Private root for survey runtime data.
: This directory must not be webserver-visible as static content.

`publicBaseUrl`
: Required absolute URL.
: Base URL corresponding to `publicDir`.
: If survey `foo` is deployed, its survey page URL is `${publicBaseUrl}/foo/`.

`cgiBaseUrl`
: Required absolute URL.
: Base URL corresponding to `cgiDir`.
: If survey `foo` is deployed, its CGI URLs are `${cgiBaseUrl}/foo/save<cgiExtension>` and `${cgiBaseUrl}/foo/report<cgiExtension>`.

`nodeExecutable`
: Required target-host executable path.
: Exact Node.js executable used in CGI shebang lines.
: Must point to a Node.js 20 runtime on the target.

`cgiExtension`
: Required string beginning with `.`.
: Filename extension used for deployed CGI executables.
: Example: `.cgi`.

## Target-type-specific keys

### SSH target

`sshTarget`
: Required when `type` is `"ssh"`.
: SSH destination used by deployment transport commands such as `scp` and `ssh`.

### Container target

`containerName`
: Required when `type` is `"container"`.
: Stable name of the built or run container image/container for this target.

## Path rules

- `publicDir`, `cgiDir`, and `dataDir` are plain target-host paths.
- `publicDir`, `cgiDir`, and `dataDir` may be absolute paths or paths relative to the target working directory where deployment extraction runs.
- Deployment may create missing survey subdirectories inside those target-wide roots.
- `~` is not supported in deployment target paths.

## Deployment meaning

For each selected survey `<surveyName>`, deployment must produce:

- public files under `${publicDir}/${surveyName}/`
- CGI executables under `${cgiDir}/${surveyName}/`
- private runtime data under `${dataDir}/${surveyName}/`

The private runtime directory for one survey contains:

- survey configuration and other survey-private runtime files under `${dataDir}/${surveyName}/survey/`
- saved answers under `${dataDir}/${surveyName}/answers/`

Generated public files in one survey directory may refer only to:

- files in the same `${publicDir}/${surveyName}/` directory
- URLs under the same survey name

Generated CGI executables in one survey directory may refer only to:

- files in the same `${cgiDir}/${surveyName}/` directory
- the same survey's private directory under `${dataDir}/${surveyName}/`

## URL contract

For each deployed survey `<surveyName>`:

- survey page URL: `${publicBaseUrl}/${surveyName}/`
- save CGI URL: `${cgiBaseUrl}/${surveyName}/save${cgiExtension}`
- report CGI URL: `${cgiBaseUrl}/${surveyName}/report${cgiExtension}`

Generated survey HTML must submit to its own save CGI URL.
Generated survey HTML and report output must not contain links to other surveys unless explicitly configured elsewhere.

## Runtime contract

- CGI executables must be self-contained JavaScript files with no project-local runtime imports.
- CGI executables must have a shebang using `nodeExecutable`.
- CGI executables must be deployed with executable permissions.
- Deployment may assume Node.js 20 on the target and must not assume any other globally installed npm packages.

## Minimal examples

SSH host:

```json
{
  "type": "ssh",
  "sshTarget": "survey@example.test",
  "publicDir": "sites/example.test/surveys",
  "cgiDir": "sites/example.test/cgi-bin",
  "dataDir": "private/associative-survey",
  "publicBaseUrl": "https://example.test/surveys",
  "cgiBaseUrl": "https://example.test/cgi-bin",
  "nodeExecutable": "/usr/local/bin/node",
  "cgiExtension": ".cgi"
}
```

Container:

```json
{
  "type": "container",
  "containerName": "associative-survey-demo",
  "publicDir": "/app/public",
  "cgiDir": "/app/cgi-bin",
  "dataDir": "/app/data",
  "publicBaseUrl": "http://localhost:8080/surveys",
  "cgiBaseUrl": "http://localhost:8080/cgi-bin",
  "nodeExecutable": "/usr/local/bin/node",
  "cgiExtension": ".cgi"
}
```
