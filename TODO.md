# TODO

- turn `scripts/test-container.sh` into Gherkin feature coverage under `tests/integration`
- turn `scripts/test-integration.sh` into Gherkin feature coverage under `tests/integration`
- turn `scripts/test-ssh-deployment.sh` into Gherkin feature coverage under `tests/integration`
- decide whether `scripts/test-visual.sh` is supported automated test coverage or an intentionally manual helper, and if it is supported, turn it into Gherkin feature coverage under `tests/integration`
- remove or narrow the old shell-script test entrypoints after their replacement Gherkin coverage is verified
- each npm script should be inlined in package.json if it is a shell one-liner, like `clean` and `nuke` are; the only essential effect in those is `rm`; non-essential output should be avoided
- make `nuke` call `clean` so improvement to latter can be done in one place only
- in general, try to follow DRY (don't repeat yourself) harder
- in general, try to avoid corner cases and even ignore rare error cases to avoid complicating code.

## deployment scripting

Both container and ssh deployment shall
- extract the tarball in place at target
  - ssh can just run tar there and redirect tarball via stdin
  - container may have to
    - copy the whole deployable tarball to target
    - extract files from it directly into their correct places
    - remove the tarball
- if setup script has nothing to do after files are extracted with correct properties, we can omit it.

## Keep survey answers in local storage

- whenever form state changes, save it to local storage
- when landing on the page, populate form and its visualizations from the local storage

## Survey sections as tabs

Report should show all results on a continuous page without sections for easy printing.

- Turn sections into tabs on the survey page, so that their titles are shown neatly spaced and visually represented as tabs above an area where only the selected section's contents are shown.
- Add visual hints whether a section is unanswered or partially or fully answered. This could be a dimly colored (light gray?) progress bar under each tab, showing the percentage of answered questions in that section as a more deeply colored (dark gray?) bar on it.

## Custom CSS and scripts should override defaults individually

When generating survey page, custom CSS and script sections should add to or override existing individual entries or functions in the respective sets.

## Provide a CGI script to upload new surveys

Once a container is deployed, it cannot be taken down as it may contain answer files.
Answer files should not leave the storage they are in as they are not anonymized.

- ensure save and report scripts are not dependent on injected stuff of specific surveys
- upload script should accept tar.gz and/or zip file
- it should check that the extract paths are correct for the target environment and contain expected files only
- then it can extract them and check their permissions
- provide a sender script for sending new surveys to a target (takes path to survey directory, uses target from target directory of that path)
