# VPS Deployment

Deployment v3 uses two explicit steps:

1. generate deployment artifacts in this workspace
2. run the generated `deploy.sh` from this workspace

For an SSH target, package either the whole target or one survey:

```bash
npm run build
npm run package:target -- targets/<target-name>
```

or:

```bash
npm run build
npm run package:survey -- targets/<target-name>/surveys/<survey-name>
```

Both commands generate:

```text
deploy/<target-name>/
  deploy.sh
  package.tar.gz
  files/
    root/...
    home/...
```

Deploy by running:

```bash
sh deploy/<target-name>/deploy.sh
```

The generated script streams `package.tar.gz` into `ssh <sshTarget> tar xPzvf -`.

## Target path rules

For deployment v3, `publicDir`, `cgiDir`, and `dataDir` in `target.json` must be either:

- absolute target paths
- relative paths under the remote default directory where `tar` runs

Do not use `~` in deployment paths.

## Runtime layout

Each packaged survey installs:

- public HTML under `<publicDir>/<surveyName>/`
- saver and reporter CGI files under `<cgiDir>/<surveyName>/`
- seed survey JSON under `<dataDir>/<surveyName>/survey.json`
- saved answers under `<dataDir>/<surveyName>/answers/`

## Verification status

The SSH deployment flow was updated to deployment v3, but live Docker/SSH verification could not be completed in the sandbox. Check [docs/deployment-v3-implementation.md](/home/kato/omat/associative-questionnaire/docs/deployment-v3-implementation.md) before relying on it.
