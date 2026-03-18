# VPS Deployment

This project can be deployed to a VPS-style Linux server where static survey pages and CGI scripts are installed by one user, while the web server process uses a different home directory.

See [ssh.md](/home/kato/omat/associative-questionnaire/docs/deployment/ssh.md) for the SSH-hosting constraints, the `/./` path split rule, and the planned `targets/<target-name>/target.json` deployment configuration model.

## Prepare deployment assets

From the repository root:

```bash
npm run build
npm run prepare:container -- <target-name>
```

That prepares:

- generated survey page under `deploy/generated/public/surveys/`
- CGI scripts under `deploy/generated/public/cgi-bin/`
- runtime seed survey JSON under `deploy/generated/runtime/surveys/`
- generated target settings manifest under `deploy/generated/container-target-settings.json`
- reporter protection secret under `.deploy/reporter-protection-secret.txt`

## Install by SSH

If the remote target is configured under `targets/<target-name>/target.json`, install it with:

```bash
npm run install:ssh -- <target-name>
```

That command:

- runs `npm run build`
- runs `npm run prepare:container -- <target-name>`
- loads the SSH target config from `targets/<target-name>/target.json`
- copies generated survey pages to the configured `publicPath`
- copies generated CGI scripts to the configured `cgiPath`
- copies seed survey JSON files to `dataDir/surveys`
- copies the local reporter protection secret to `protectionFile`
- makes the remote CGI scripts executable

If the web server executes CGI scripts with a different effective home directory than the SSH account, use the manual steps below instead.

## Install public files

Copy the prepared public tree to the web root served by your CGI-capable server:

- `deploy/generated/public/surveys/`
- `deploy/generated/public/cgi-bin/`

The CGI scripts are plain JavaScript and must stay executable.

## Install runtime seed survey JSON

Copy the prepared seed survey JSON from `deploy/generated/runtime/surveys/` into the configured runtime data directory under:

```text
<dataDir>/surveys/
```

If the deploy user home and the web server process home differ, do not place runtime data under the deploy user home by accident. The runtime data must live under the configured shared data path seen by the CGI process.

## Runtime directories

At runtime the system uses the configured `dataDir`:

```text
<dataDir>/
  surveys/
  answers/
```

The saver creates `answers/<surveyName>/` on demand. The reporter reads stored survey JSON from `surveys/`.

## Protected reporter secret

The deploy preparation step generates `.deploy/reporter-protection-secret.txt` locally in the workspace, injects the same secret into the prepared reporter CGI script, and the SSH installer copies that secret to the configured remote `protectionFile`.

Keep the local secret file available for future protected survey administration.
