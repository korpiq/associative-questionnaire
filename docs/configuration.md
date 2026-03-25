# Configuration

## targets/ Directory Layout

Each deployment target lives under `targets/<targetName>/`:

```
targets/
  <targetName>/
    target.json
    surveys/
      <surveyName>/
        survey.json
        template.html
        custom.css        (optional)
        custom.js         (optional)
```

- `targetName` comes from the directory name, not from JSON.
- `surveyName` comes from the survey subdirectory name, not from JSON.
- Each survey directory must contain `survey.json` and `template.html`.
- Optional `custom.css` and `custom.js` are appended after the generator defaults.

## target.json

One JSON object per target. All keys are strict — unknown keys are configuration errors.

### Shape

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

Container targets use `"type": "container"` and `containerName` instead of `sshTarget`.

### Required fields

`type`
: One of `"ssh"` or `"container"`.

`publicDir`
: Target-host path. Directory where generated survey web files are deployed. Must be webserver-visible.

`cgiDir`
: Target-host path. Directory where generated CGI executables are deployed. Must be executable by the web server.

`dataDir`
: Target-host path. Private root for survey runtime data. Must not be webserver-visible as static content.

`publicBaseUrl`
: Absolute URL. Base URL corresponding to `publicDir`. Survey `foo` is served at `${publicBaseUrl}/foo/`.

`cgiBaseUrl`
: Absolute URL. Base URL corresponding to `cgiDir`. Survey `foo` has CGI URLs at `${cgiBaseUrl}/foo/save${cgiExtension}` and `${cgiBaseUrl}/foo/report${cgiExtension}`.

`nodeExecutable`
: Target-host path. Exact Node.js 20 executable used in CGI shebang lines.

`cgiExtension`
: String starting with `.`. Filename extension for deployed CGI executables, e.g. `.cgi`.

### SSH target fields

`sshTarget`
: Required when `type` is `"ssh"`. SSH destination used by `scp` and `ssh` commands.

### Container target fields

`containerName`
: Required when `type` is `"container"`. Name of the built or running container image for this target.

### Path rules

- `publicDir`, `cgiDir`, and `dataDir` are target-host paths.
- Each may be absolute or relative to the default remote working directory where `tar` extracts.
- `~` is not supported.
- Missing survey subdirectories inside those roots are created by deployment.

### URL contract

For each deployed survey `<surveyName>`:

- survey page: `${publicBaseUrl}/${surveyName}/`
- save CGI: `${cgiBaseUrl}/${surveyName}/save${cgiExtension}`
- report CGI: `${cgiBaseUrl}/${surveyName}/report${cgiExtension}`

### Runtime contract

- CGI executables must be self-contained JavaScript files with no project-local imports.
- CGI executables are deployed with executable permissions.
- Node.js 20 must be available at `nodeExecutable` on the target.

## Examples

SSH host:

```json
{
  "type": "ssh",
  "sshTarget": "survey@example.test",
  "publicDir": "sites/example.test/www/surveys",
  "cgiDir": "sites/example.test/www/cgi-bin",
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
