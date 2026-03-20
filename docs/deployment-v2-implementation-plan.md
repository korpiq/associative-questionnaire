# Deployment v2 implementation plan

Implement deployment v2 around one canonical per-survey layout with no exceptions.

## 1. Lock the target contract

- Keep target types as `container` and `ssh`.
- Use only target-wide roots in `target.json`: `publicDir`, `cgiDir`, `dataDir`, `publicBaseUrl`, `cgiBaseUrl`, `nodeExecutable`, `cgiExtension`, plus `sshTarget` or `containerName`.
- Remove `protectionFile` from docs and implementation.
- Remove `/./` split-path behavior from docs and implementation.

## 2. Use one deployed survey layout

For each survey `<surveyName>`:

- public files in `${publicDir}/${surveyName}/`
- CGI files in `${cgiDir}/${surveyName}/`
- private data in `${dataDir}/${surveyName}/`

Contents:

- public: `index.html`, `ok.html`, `fail.html`
- CGI: `save<cgiExtension>`, `report<cgiExtension>`
- private data: `survey.json`, `answers/<session-id>.json`

CSS is embedded:

- survey CSS in `index.html`
- report CSS in `report<cgiExtension>`

## 3. Refactor generated artifact settings

- Replace shared target-level saver/reporter runtime settings with per-survey settings.
- Generate survey and CGI URLs from `publicBaseUrl`, `cgiBaseUrl`, `surveyName`, and `cgiExtension`.
- Generate private runtime paths from `dataDir` and `surveyName`.

## 4. Refactor survey build outputs

- Build each survey into its own artifact set under `targets/<targetName>/`.
- Generate `index.html`, `ok.html`, `fail.html`, `save<cgiExtension>`, and `report<cgiExtension>` per survey.
- Inline CSS into generated HTML and CGI outputs.
- Use `esbuild` to bundle each generated CGI script into one self-contained deployed file.
- Keep runtime data-file access as part of the CGI runtime contract; self-contained means code packaging, not the removal of survey JSON or answer-file reads.
- Make bundled CGI scripts use `nodeExecutable` in the shebang.

## 5. Refactor CGI runtime path resolution

- Make each CGI script resolve runtime files relative to `dirname(process.env.SCRIPT_FILENAME)`.
- From the CGI script location, resolve only that survey's `survey.json` and `answers/` directory.
- Remove runtime assumptions based on `HOME`, shared injected target paths, or deployment workspace files.

## 6. Build deployable target packages

- Build one tarball per target containing only the selected surveys and a setup script.
- Package only deployed files:
- `payload/public/<surveyName>/`
- `payload/cgi/<surveyName>/`
- `payload/data/<surveyName>/`
- `setup.sh`
- Do not package source workspace files or build tooling.

## 7. Write the setup script

- Copy extracted payload files into the configured `publicDir`, `cgiDir`, and `dataDir`.
- Let tar extraction create the temporary package workspace and the setup script copy create the deployed directories.
- Never remove existing files from the target host.
- Leave undeployed surveys untouched.
- Mark CGI files executable.
- Remove the deployed tarball and extracted package workspace after successful setup.

## 8. Simplify deployment commands

- `build:survey` builds selected surveys into the canonical artifact layout.
- `build:deployment` packages already built surveys for one target and writes the setup script.
- `deploy:built` transfers one prepared target package and runs its setup script.
- `deploy` performs build and deploy in one flow.

## 9. Make container deployment use the same model

- Make the container image use the same `publicDir`, `cgiDir`, `dataDir`, URL rules, and per-survey layout as SSH targets.
- Do not rely on hard-coded container paths outside `target.json`.
- Keep container deployment as a packaging and runtime test target for the same artifact format.

## 10. Add portability acceptance coverage

- Gherkin coverage for target parsing with the new schema.
- Gherkin coverage for per-survey generated artifact layout.
- Gherkin coverage for CGI runtime path resolution from `SCRIPT_FILENAME`.
- Docker-backed integration coverage for the first working container deployment through deployed survey and CGI URLs.
- End-to-end deployment tests to a container acting as an SSH host with:
- different public, CGI, and private data roots
- multiple surveys on one target
- partial deployment without touching undeployed surveys
- successful save and report behavior through deployed URLs
