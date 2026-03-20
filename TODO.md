# TODO

## Deployment v2 test-first steps

Use `docs/deployment-v2-implementation-plan.md` and `docs/deployment-targets.md` as the contract. For each step, start by adding or extending a failing test:

- use `tests/feature` for production-code behavior
- use `tests/integration` for deployment-side behavior

Ordered steps to reach the first working deployment:

- bundle generated CGI scripts with `esbuild` into one self-contained deployed file each
  Keep runtime data-file access as an explicit supported dependency.
- make CGI runtime path resolution depend on `SCRIPT_FILENAME` and the canonical per-survey layout only
- generate per-survey deployable artifacts: `index.html`, `ok.html`, `fail.html`, `save<cgiExtension>`, `report<cgiExtension>`, and private `survey.json`
- update container preparation to place files according to `publicDir`, `cgiDir`, and `dataDir` from `target.json`
- update the container runtime image so only deployed artifacts are present and served from configured target paths
- add an integration test for the first working container deployment covering survey load, save, and report through deployed URLs
- replace SSH deployment packaging with target tarball plus setup script based on the same per-survey artifact layout
- add an integration test for the first working SSH-style deployment to a containerized host with distinct public, CGI, and private-data roots

## Keep survey answers in local storage

- whenever form state changes, save it to local storage
- when landing on the page, populate form and its visualizations from the local storage

## Survey sections as tabs

Report should show all results on a continuous page without sections for easy printing.

- Turn sections into tabs on the survey page, so that their titles are shown neatly spaced and visually represented as tabs above an area where only the selected section's contents are shown.
- Add visual hints whether a section is unanswered or partially or fully answered. This could be a dimly colored (light gray?) progress bar under each tab, showing the percentage of answered questions in that section as a more deeply colored (dark gray?) bar on it.

## Custom CSS and scripts should override defaults individually

When generating survey page, custom CSS and script sections should add to or override existing individual entries or functions in the respective sets.

## Survey customization

Surveys should have customizable success and failure pages and CSS file for saver and reporter. So each survey should have its own directory on the webserver to contain all those.

Contents for each of them can come from separate files or the template html.
Add success and fail portions to the default template for that.

## Provide a CGI script to upload new surveys

Once a container is deployed, it cannot be taken down as it may contain answer files.
Answer files should not leave the storage they are in as they are not anonymized.

- ensure save and report scripts are not dependent on injected stuff of specific surveys
- upload script should accept tar.gz and/or zip file
- it should check that the extract paths are correct for the target environment and contain expected files only
- then it can extract them and check their permissions
- provide a sender script for sending new surveys to a target (takes path to survey directory, uses target from target directory of that path)
