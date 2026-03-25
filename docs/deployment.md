# Deployment

## Overview

Deployment is two steps:

1. **Package** — generate deployment artifacts in the workspace under `deploy/<targetName>/`.
2. **Deploy** — run the generated `deploy.sh` from the workspace root.

## Packaging

Package all surveys in a target:

```bash
npm run package:target -- targets/<targetName>
```

Package one survey (target is inferred from the survey path):

```bash
npm run package:survey -- targets/<targetName>/surveys/<surveyName>
```

Both commands write output to `deploy/<targetName>/`.

## Generated Output

```
deploy/<targetName>/
  deploy.sh         deployment script — run this from the workspace root
  package.tar.gz    tarball with all deployed files at their final target paths
  files/
    root/           files with absolute target paths
    home/           files with paths relative to the remote working directory
```

`files/` is for inspection. The tarball is built from it with final target paths already embedded. Extraction alone installs everything — no copy or chmod phase is needed on the target.

The output shape is identical for `ssh` and `container` targets; only `deploy.sh` differs by transport.

A partial package (from `package:survey`) includes only the selected survey. Unpackaged surveys are not touched on the target when `deploy.sh` runs.

## Deploying

Run the generated script from the workspace root:

```bash
sh deploy/<targetName>/deploy.sh
```

### SSH

The script streams the tarball over SSH:

```sh
ssh <sshTarget> tar xPzvf - < package.tar.gz
```

The `-P` flag preserves absolute paths. GNU tar is required on the target (`apk add tar` on Alpine).

### Container

The script pipes the tarball into the container:

```sh
docker exec -i <containerName> tar xPzvf - < package.tar.gz
```

The container must be running before `deploy.sh` is executed.

## Sample Target

`targets/sample` contains a pre-configured container target and a sample survey. To build and deploy it locally:

```bash
npm run build
npm run package:target -- targets/sample
docker build -t associative-survey:test .
docker rm -f associative-survey-local 2>/dev/null; docker run -d --name associative-survey-local -p 18080:8080 associative-survey:test
sh deploy/sample/deploy.sh
```

Survey page: `http://127.0.0.1:18080/surveys/survey/`
Report: `http://127.0.0.1:18080/cgi-bin/survey/report.cgi`

Stop the container:

```bash
docker rm -f associative-survey-local
```
