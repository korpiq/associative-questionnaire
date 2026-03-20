## Deployment v2

First version of deployment has path traversal issues that prevent it from working.
Here we redesign to make it simple and unambiguous so it works.

## Deployment targets

We target two kinds of environments:

1. Container
   - mostly for testing and demonstration.
2. Remote host
   - file transfer of deployable tarball with scp
   - extract deployable tarball and run setup script with ssh.

### Artifacts

All artifacts should be created under `targets/` based on source files there.
`targets/sample` should contain source material for a container all test and demonstration material and be stored in this project's version control.

All other files under `targets/` should be ignored by this project's version control, allowing for a local version control of those files.

#### Survey artifacts

Generated based on source files (`survey.json`) in a survey's directory `targets/<targetName>/surveys/<surveyName>`
- `index.html` (the survey page)
- `save.cgi` (saves survey form input from payload as json to a file)
- `report.cgi` (generates a report page of all answers to this survey)

Optional source files to include as survey artifacts if they exist:
- `ok.html` (for save.cgi to redirect to upon success)
- `fail.html` (for save.cgi to redirect to upon success)
- `survey.css` (inlined into survey page for styling it)
- `report.css` (for styling the report)

Default templates for optional source files should be implemented under `src/defaults`.

When an optional source file does not exist, first look for it under `targets/<targetName>/defaults/`, then under `src/defaults`.

#### Target host deployment artifacts

Generated based on `target.json` in `targets/<targetName>` and previously generated survey build artifacts in its `surveys/` subdirectories:
- `<targetName>.tar.gz` containing all files to deploy, including setup script to run on the target host
- `deploy.sh` shell script

### Deployment

1. Deployables are be packaged into gzipped tarballs (`*.tar.gz`) for transfer. A deployable should contain only
    - the files and directories associated with selected surveys to deploy on a single target
    - and setup script to run on the target host
2. Deployment shell script `deploy.sh` that
    - builds and runs target container if that is the target type
    - copies deployable contents to target server
    - runs the setup script there.
3. There should be one `npm` command for each
    - `build:survey`: build survey files for use or inspection
      - parameters: list of survey directories to build, default none
      - produces `index.html` (the survey page), `save.cgi`, `report.cgi` in each survey directory
    - `build:deployment`: build deployable and deployment script of a target host for use or inspection
       - parameters: path to one built target and optional list of built surveys (paths or names) there to deploy
       - only packages surveys that have already been built for that target host
       - builds also a deployment shell script
    - `deploy:built`: deploy prebuilt deployable with its deployment script
       - parameters: path to one built target
    - `deploy`: do all of above to have single deployment command
       - parameters: path to one target and optional list of surveys (paths or names) there to deploy
4. All parameters for those commands except limiting to specific targets/surveys should come from target and survey configuration files `target.json` and `survey.json`.
5. Build system should work in `make` style, generating files from existing ones under same directories under `targets/`

### Constraints on remote host

1. webserver may see a different path to files, so all file references must be relative.
2. webserver CGI javascript files 
   - must be self-contained (no imports except from `node`)
   - nodejs version 20
   - exact location of `nodejs` for the shebang line is configured in `target.json` as `nodejs`.
   - file extension `.cgi`
   - executable bit on.

### Remote host testing

1. Tests covering deployment to remote host shall use a container as test target system.
2. Test must be written as Gherkin features and cover
   - different custom file paths on target host
   - answering different surveys, saving successfully, and getting correct reports.

## Standalone surveys

1. Each deployment target may host multiple surveys.
2. Each survey lives in its own subdirectory on the target.
    - including its own save and report CGI scripts.
3. Each survey stores its private files (configuration and answers) in its own subdirectory in a data directory that is not visible over the web.
4. Each survey is fully self-contained:
   - files in survey web directory may refer only to each other and same survey's data directory
   - data directory must be referred to by relative path, because webserver may see it in a different path
