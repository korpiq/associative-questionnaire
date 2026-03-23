# Deployment v3 plan

Deployment v3 should separate packaging from deployment.

- `package` means generating the artifacts needed for deployment in this workspace.
- `deploy` means running the generated `deploy.sh` from this workspace so the target is updated.

## Goals

- Generate one canonical installable file set for both `ssh` and `container` targets.
- Keep deployment to two explicit steps:
  1. generate the package in this workspace
  2. run the generated `deploy.sh` in this workspace
- Accept only workspace paths as CLI inputs:
  - one command takes a target folder path
  - one command takes a survey folder path
- Remove older commands and documentation that describe separate target-specific preparation or installation flows.

## Commands

Add exactly these npm commands:

1. `npm run package:target -- <target-folder>`
   Generate deployable artifacts for every survey under the given target folder.

2. `npm run package:survey -- <survey-folder>`
   Generate deployable artifacts for only the given survey folder and infer the containing target from its path.

Path rules:

- `<target-folder>` must resolve to one target directory that contains `target.json`.
- `<survey-folder>` must resolve to one survey directory inside `targets/<targetName>/surveys/`.
- The survey command must derive its target from the survey path instead of taking a second argument.

There should be no npm deploy command. Deployment is running the generated `deploy.sh` directly.

## Generated output

Write package output under `deploy/<targetName>/`.

Suggested shape:

```text
deploy/<targetName>/
  deploy.sh
  package.tar.gz
  files/
    root/...
    home/...
```

Rules:

- The relative file list inside `files/` must be identical for `ssh` and `container` targets.
- Target type may change file contents when needed, but not the local package shape.
- `package.tar.gz` and `deploy.sh` must be generated for both target types.
- `deploy.sh` must be the only generated deployment entrypoint.
- `files/root/` holds files whose target paths are absolute.
- `files/home/` holds files whose target paths are relative to the default remote working directory where `tar` runs.

## Path simplification

To keep deployment minimal, narrow the deployment path contract in v3:

- `publicDir`, `cgiDir`, and `dataDir` must not use `~`
- each deployment path must be either:
  - absolute on the target
  - relative to the default directory where remote `tar` runs
- remove `~` handling from deployment packaging and deployment docs

Reason:

- this keeps direct streamed tar extraction possible on both `ssh` and `container` targets
- this removes staging-directory, copy, chmod, cleanup, and home-directory expansion logic from the deployment script
- relative paths naturally extract under the default remote working directory without extra handling

## Tarball contract

The tarball should carry the final deployed files with their final target paths.

Rules:

- file modes in the tarball must already include CGI executability
- tarball extraction alone should be sufficient to install the files
- no extracted temporary workspace should be needed on the target
- no extra copy phase should be needed on the target
- entries generated from `files/root/` must be archived as absolute target paths
- entries generated from `files/home/` must be archived as relative target paths

This means the tar builder must be able to write archive entry names as final target paths, while the local `files/` tree remains easy to inspect in the workspace.

## Deployment script

Rename the generated installer to `deploy.sh`.

`deploy.sh` is run in this workspace, not on the target.

### SSH target

Prefer direct streamed extraction:

```sh
ssh <sshTarget> tar xPzvf - < package.tar.gz
```

Rules:

- do not upload a tarball as a separate remote file
- do not create a remote staging directory
- do not run a remote copy phase after extraction
- do not run a remote chmod phase after extraction
- the tarball may contain both absolute and relative entries
- relative entries must extract relative to the remote default working directory naturally

### Container target

Prefer the same minimization:

```sh
docker exec -i <containerName> tar xPzvf - < package.tar.gz
```

Rules:

- do not `docker cp` the tarball into the container first
- do not create a temporary install directory in the container
- do not run a second copy phase inside the container
- do not run a chmod phase after extraction
- the tarball may contain both absolute and relative entries
- relative entries must extract relative to the container default working directory naturally

The only intended target-specific difference is transport:

- `ssh`: `ssh`
- `container`: `docker exec`

The tarball contents and install semantics should otherwise match.

## Selection model

Implement one shared package builder that accepts:

- `targetDirectory`
- `selectedSurveyDirectories`

Rules:

- `package:target` selects every survey in the target folder.
- `package:survey` selects only the one survey folder passed on the command line.
- The generated package must never include surveys outside the explicit selection.
- Partial deployment must leave undeployed surveys untouched on the target.

## CLI changes

Add new workspace-path CLIs behind the npm commands:

- `src/cli/package-target.ts`
- `src/cli/package-survey.ts`

Add small shared path readers:

- resolve a target directory path and load its `target.json`
- resolve a survey directory path and derive both its survey name and target directory

Keep path validation strict:

- reject paths outside `targets/`
- reject survey folders without both `survey.json` and `template.html`
- reject target folders without `target.json`

## Refactoring plan

1. Extract one shared package builder from the current SSH package builder and container layout builder.
2. Make that builder write the canonical local `files/root/` and `files/home/` trees plus `package.tar.gz`.
3. Change the tar builder so `files/root/` entries are archived as absolute target paths and `files/home/` entries are archived as relative target paths from `target.json`.
4. Generate one `deploy.sh` beside the tarball that streams `package.tar.gz` into either `ssh tar xPzvf -` or `docker exec -i ... tar xPzvf -`.
5. Add the two new path-based CLIs and npm scripts.
6. Update executable specs and integration coverage to use the new package commands and generated `deploy.sh`.
7. Remove the replaced preparation and install commands.
8. Remove or replace old documentation that still describes the pre-v3 preparation and deployment flows.

## Commands to remove

Plan removal of these older entrypoints after the new flow is verified:

- `npm run prepare:container`
- `npm run install:ssh`
- `src/cli/prepare-container-assets.ts`
- `src/cli/install-vps-over-ssh.ts`
- `src/cli/install-prepared-container-target.ts`

Also remove or narrow any helper that exists only to support those entrypoints once the shared v3 package builder and `deploy.sh` are in place.

## Documentation changes

Remove or replace documentation that describes old ways to prepare or deploy:

- old `prepare:container` workflows
- old `install:ssh` workflows
- any docs that describe target-name-only deployment commands
- any docs that describe staged remote extraction, copy, chmod, or cleanup if v3 no longer needs them

The replacement documentation should describe only:

1. `npm run package:target -- <target-folder>` or `npm run package:survey -- <survey-folder>`
2. running the generated `deploy/<targetName>/deploy.sh`

## Test coverage

Add executable coverage for:

- path-based target CLI selection
- path-based single-survey CLI selection
- identical local `files/` lists for `ssh` and `container` targets
- generated tarball contents for full-target and single-survey packaging
- generated `deploy.sh` command contents for `ssh` and `container`
- partial deployment preserving undeployed surveys
- successful end-to-end deployment through both transports using the same tar-extract installation model

## Non-goals

- Do not add a third command for package-only vs deploy-only; the package commands already cover generation and `deploy.sh` covers deployment.
- Do not keep separate generated package formats for `ssh` and `container`.
- Do not require target names as CLI parameters once the path-based commands exist.
