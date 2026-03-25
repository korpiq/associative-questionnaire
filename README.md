# Associative Survey

A survey system built around a single generated HTML page. The main feature is presenting two groups of phrases and letting respondents draw connections between them. Surveys are configured as JSON, rendered to standalone HTML pages, submitted through a shared CGI script, and reported through a CGI reporter.

Supported question types: single-choice, multi-choice, free-text, and associative.

Answer data is stored per-respondent per-survey as JSON files. Respondent identity is a cookie set on first submission; no other identifying information is collected.

## Quickstart

Run the tests:

```bash
npm test
```

Generate a standalone survey page from the sample:

```bash
npm run generate -- targets/sample/surveys/survey/survey.json targets/sample/surveys/survey/template.html survey.html https://example.test/cgi-bin/survey/save.cgi
```

Build and deploy the sample target to a local container:

```bash
npm run build
npm run package:target -- targets/sample
docker build -t associative-survey:test .
docker run -d --name associative-survey-local -p 18080:8080 associative-survey:test
sh deploy/sample/deploy.sh
```

Survey: `http://127.0.0.1:18080/surveys/survey/`
Report: `http://127.0.0.1:18080/cgi-bin/survey/report.cgi`

## Documentation

- [docs/architecture.md](docs/architecture.md) — system overview: components, filesystem layout, submission flow
- [docs/generator.md](docs/generator.md) — survey.json schema, HTML templates, snippet overrides, custom assets
- [docs/configuration.md](docs/configuration.md) — targets/ directory layout, target.json reference
- [docs/deployment.md](docs/deployment.md) — packaging commands, deploy/ artifacts, running deploy.sh
- [docs/survey-page.md](docs/survey-page.md) — browser-side features: local storage, association linker
- [docs/testing.md](docs/testing.md) — test commands and conventions

## Feature Specifications

All supported behavior is specified as Gherkin under `tests/feature/`. Only behavior described there is considered supported.

## Development Constraints

- Browser-side JavaScript must stay minimal and compatible with major desktop and mobile browsers.
- CGI scripts must be plain JavaScript (no TypeScript-only features at runtime).
- Generator and reporter are TypeScript/Node.js 20.
- Data integrity is enforced with Zod schemas.
