# SSH Deployment Constraints

This note records the current SSH-hosted deployment model for the target VPS service.

## Remote layout

- We connect by `ssh` to one server.
- The deployable web-visible tree must be installed under:

```text
~/sites/<domain-name>/www
```

- The web server can see everything inside the `sites` folder.
- CGI scripts may be placed anywhere under `~/sites/<domain-name>/www`.
- A file under that tree is executed as CGI when it has the execute bit set, instead of being served as a static file.

## Split home directories

- The web server process does not see the same home directory path that we see over SSH.
- The SSH CGI environment does not define `HOME`.
- Because of that, paths under the SSH-visible home directory outside `~/sites/` must not be used for CGI runtime data.
- The earlier assumption that runtime survey JSON or answer files could be placed under `~/.local/share/associative-survey/` from the SSH side does not match this hosting model.
- On this host, CGI runtime paths must therefore be absolute paths or be derived from `SCRIPT_FILENAME`, which is absolute.

## Writable runtime area

- The web server can write anywhere within the folder containing the deployed site tree.
- That writable path is visible to the web server under a different filesystem path than the one seen from the SSH login.
- Deployment logic therefore needs to treat the `sites` tree as the shared filesystem boundary between the SSH host view and the web server view.

## Practical implications

- Public survey pages and CGI scripts should be deployed under `~/sites/<domain-name>/www`.
- CGI runtime data must also live somewhere under the deployed `sites` tree, not under the SSH home outside it.
- Installer logic for this hosting target must be based on the `sites` tree layout rather than on remote `$HOME` runtime paths.
- CGI runtime path resolution for this host must not depend on `HOME`.
- When relative layout is needed at CGI runtime, it should be derived from the absolute `SCRIPT_FILENAME` path instead.

## Deployment path concepts

For SSH deployment, it is useful to model three remote path targets:

- public files
  This is where web-visible static files are installed, such as generated survey HTML pages.
- CGI scripts
  This is where executable CGI entrypoints are installed.
- data files
  This is where survey definitions, stored answers, and similar runtime data live without being served directly by the web server.

These targets should be configured independently, because some hosts allow CGI scripts inside the public tree, while others place them in a separate CGI directory.

## Existing root and deploy-created subpath

Each of the three path targets should be split into two parts:

- existing root
  A path segment that must already exist on the remote host before deployment.
  Example: `~/sites/my.domain/www`
- deploy-created subpath
  A relative path segment that the installer may create if it does not already exist.
  Example: `my/survey/path`

This split makes the installer safer and more portable:

- the existing root anchors deployment into a known server-owned location
- the deploy-created subpath lets one account manage multiple survey deployments below that location

## `/./` path split rule

To make this split explicit in configuration, a deployment path may use `/./` as a separator:

- everything to the left of `/./` must already exist on the remote host
- everything to the right of `/./` may be created by deployment with `mkdir -p`

Examples:

- `~/sites/my.domain/www/./surveys`
  Required to exist already: `~/sites/my.domain/www`
  May be created by deployment: `surveys`
- `~/sites/my.domain/www/cgi-bin/./survey-tools`
  Required to exist already: `~/sites/my.domain/www/cgi-bin`
  May be created by deployment: `survey-tools`

If a configured path does not contain `/./`, deployment should treat the whole path as pre-existing and fail if it is missing.

## Default path configuration

Reasonable defaults for a generic SSH target are:

- public files
  path: `~/www/./surveys`
- CGI scripts
  default to the same target as public files unless configured separately
- data files
  path: `~/.local/share/./surveys`

These defaults are only generic fallbacks.

For the current `~/sites/<domain-name>/www` hosting model described above:

- public files should use an existing root under `~/sites/<domain-name>/www`
- CGI scripts may use the same root and either the same or a separate deploy-created subpath
- data files must not default to `~/.local/share/...` unless that path is also visible and writable from the web server side

For that hosting model, realistic path examples are:

- public files: `~/sites/<domain-name>/www/./surveys`
- CGI scripts: `~/sites/<domain-name>/www/./cgi-bin`
- data files: `~/sites/<domain-name>/www/./data`

## Target environment configuration

Deployment should move to one configuration file per target environment.

Proposed workspace layout:

```text
targets/
  <target-name>/
    target.json
    surveys/
      <survey-name>/
```

Implications:

- the target name comes from the directory name or relative path under `targets/`
- survey names for a specific target come from the subdirectories under `targets/<target-name>/surveys/`
- target configuration should not repeat `environmentName`
- target configuration should not carry an explicit `surveys` list unless a later use case requires filtering

Each target configuration file should define:

- `type`
  One of `container` or `ssh`.
- `containerName`
  Required when `type` is `container`.
  This is the container or image target name needed by the deployment flow.
- `sshTarget`
  Required when `type` is `ssh`.
  This is the SSH address, such as `user@example.test`.
- `publicPath`
  Remote path for publicly visible static files.
- `cgiPath`
  Remote path for CGI scripts.
- `dataDir`
  Remote path for non-public runtime data.

Those three paths should use the `/./` rule above.

## What Else The Configuration Should Contain

Beyond target type and target address or name, a target configuration file should also contain:

- `protectionFile`
  Local or target-relative protection secret filename.
  Default: `protection.txt` inside `dataDir`.
- `publicBaseUrl`
  Base URL for generated links and deployment output.
- `saverUrl`
  Public URL path for the saver CGI endpoint if it differs from the default generated location.
- `reporterUrl`
  Public URL path for the reporter CGI endpoint if it differs from the default generated location.
- `createMissingSubpaths`
  Whether deployment should create missing path segments to the right of `/./`.
  Default: `true`.

Not needed in the configuration at this stage:

- `environmentName`
  Comes from the target directory name or path.
- `description`
  Not needed yet.
- `domainName`
  Can stay embedded in configured paths and URLs.
- explicit survey list
  The target survey set comes from `targets/<target-name>/surveys/`.
- separate web-server-visibility flag
  The target paths themselves are the source of truth.

Current implementation direction:

- one config file per target under a dedicated deployment config directory
- one shared schema for common target fields
- one environment-specific schema extension for `ssh`
- one environment-specific schema extension for `container`
- deployment commands that take a target name instead of raw SSH or container arguments
- generated survey HTML may embed target-specific public URLs directly, such as the saver CGI form action
- generated saver and reporter CGI assets may either receive injected target settings directly or load them from generated config files placed alongside the CGI scripts
- for the SSH host described here, injected absolute runtime paths are the simpler starting point because `HOME` is unavailable in CGI
- the SSH installer currently copies survey HTML, CGI scripts, survey JSON seeds, and the reporter protection secret into separately configured `publicPath`, `cgiPath`, `dataDir/surveys`, and `protectionFile` locations
