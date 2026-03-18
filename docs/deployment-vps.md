# VPS Deployment

This project can be deployed to a VPS-style Linux server where static survey pages and CGI scripts are installed by one user, while the web server process uses a different home directory.

## Prepare deployment assets

From the repository root:

```bash
npm run build
npm run prepare:container
```

That prepares:

- generated survey page under `deploy/generated/public/surveys/`
- CGI scripts under `deploy/generated/public/cgi-bin/`
- runtime seed survey JSON under `deploy/generated/runtime/surveys/`
- reporter protection secret under `.deploy/reporter-protection-secret.txt`

## Install public files

Copy the prepared public tree to the web root served by your CGI-capable server:

- `deploy/generated/public/surveys/`
- `deploy/generated/public/cgi-bin/`

The CGI scripts are plain JavaScript and must stay executable.

## Install runtime seed survey JSON

Copy the prepared seed survey JSON from `deploy/generated/runtime/surveys/` into the effective CGI user home under:

```text
~/.local/share/associative-survey/surveys/
```

If the deploy user home and the web server process home differ, do not place runtime data under the deploy user home by accident. The runtime data must live under the CGI process home directory.

## Runtime directories

At runtime the system uses:

```text
~/.local/share/associative-survey/
  surveys/
  answers/
```

The saver creates `answers/<surveyName>/` on demand. The reporter reads stored survey JSON from `surveys/`.

## Protected reporter secret

The deploy preparation step generates `.deploy/reporter-protection-secret.txt` locally in the workspace and injects the same secret into the prepared reporter CGI script.

Keep the local secret file available for future protected survey administration.
