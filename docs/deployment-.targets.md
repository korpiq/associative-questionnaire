# `target.json` currently supported by implementation

This describes the current implementation in `src/deploy/parse-deployment-target-config.ts` and the code that consumes its result.

## Location and discovery

- A deployment target is loaded from `targets/<target-name>/target.json`.
- `targetName` is not read from JSON. It comes from the target directory name.
- The JSON object is strict: unknown keys are rejected.
- Surveys are not listed in `target.json`. They are discovered from directories under `targets/<target-name>/surveys/`, and each survey is expected at `survey.json` plus `template.html`.

## Required JSON shape

Every `target.json` must be a single JSON object with:

```json
{
  "type": "container",
  "containerName": "example-container",
  "publicPath": "/some/public/path",
  "cgiPath": "/some/cgi/path",
  "dataDir": "/some/data/path",
  "publicBaseUrl": "https://example.test/surveys",
  "saverUrl": "https://example.test/cgi-bin/save-survey.js",
  "reporterUrl": "https://example.test/cgi-bin/report-survey.js"
}
```

Or with `"type": "ssh"` and `"sshTarget"` instead of `"containerName"`.

## Supported keys

`type`
: Required. Must be `"container"` or `"ssh"`.

`sshTarget`
: Required when `type` is `"ssh"`. Must be a non-empty string. Used only by the SSH installer for `ssh` and `scp` destinations.

`containerName`
: Required when `type` is `"container"`. Must be a non-empty string. Currently validated and carried through loading, but not consumed by the current deployment commands in this repository.

`publicPath`
: Required non-empty string. Used by the SSH installer as the remote directory where generated survey HTML files are copied.

`cgiPath`
: Required non-empty string. Used by the SSH installer as the remote directory where generated CGI scripts are copied and chmodded.

`dataDir`
: Required non-empty string. Used in two places:
: `buildGeneratedTargetSettings()` derives runtime paths `${dataDir}/surveys` and `${dataDir}/answers` for generated saver/reporter CGI settings.
: The SSH installer copies runtime survey JSON files to `${dataDir}/surveys` and creates both `${dataDir}/surveys` and `${dataDir}/answers`.

`protectionFile`
: Optional non-empty string. Defaults to `${dataDir}/protection.txt`.
: Used as the reporter CGI protection-secret file path and as the SSH installer destination for the locally generated secret file.

`publicBaseUrl`
: Required URL string. Currently parsed and loaded, but not consumed by the current deployment commands in this repository.

`saverUrl`
: Required URL string. Used when generating each survey HTML page as the form `action`.

`reporterUrl`
: Required URL string. Currently parsed and loaded, but not consumed by the current deployment commands in this repository.

`createMissingSubpaths`
: Optional boolean. Defaults to `true`.
: Used only by the SSH installer together with `/./` path splitting. When `true`, path segments to the right of `/./` may be created with `mkdir -p`. When `false`, the full configured directories must already exist.

## Path handling used by SSH deployment

- `publicPath`, `cgiPath`, `dataDir`, and `protectionFile` may use the `/./` split marker.
- Only one `/./` marker is allowed in a path.
- If `/./` is present, the right side must not be empty.
- `~` and `~/...` are converted to `$HOME` in SSH shell commands.
- `protectionFile` is uploaded to its resolved full path, with `/./` collapsed to `/`.

## What container preparation currently uses

For `npm run prepare:container -- <target-name>`, the current implementation uses:

- discovered surveys from `targets/<target-name>/surveys/`
- `dataDir` to build saver/reporter runtime settings
- `protectionFile` for the reporter CGI secret path
- `saverUrl` for generated survey form actions

It does not currently use:

- `containerName`
- `publicPath`
- `cgiPath`
- `publicBaseUrl`
- `reporterUrl`
