# Docs update plan

## Goal

Replace obsolete documentation with a small set of accurate, readable docs. Feature specs remain the source of truth for specific behavior; docs give an overview and guide setup and usage.

## Target structure

```
docs/
  architecture.md       new — concise rewrite of system-design.md
  configuration.md      from deployment-targets.md — target.json reference + targets/ layout + survey file placement
  deployment.md         new — package commands, deploy/ artifacts, running deploy.sh
  generator.md          update — survey.json schema, templates, snippet overrides, custom assets, generate command
  survey-page.md        new — browser-side features: local storage, association linker
  testing.md            keep as-is
  plans/
    survey-tabs.md      moved from survey-tabs-design.md
    testing-refactor.md moved from testing-refactor.md
README.md               rewrite — one-paragraph summary, quickstart, pointers to docs/
```

## Files to remove

- `docs/cgi-reporter.md` — only a pointer, no content
- `docs/later.md` — deferred ideas, no longer needed
- `docs/local-storage-design.md` — content moves to survey-page.md
- `docs/system-design.md` — replaced by architecture.md
- `docs/deployment-v2-plan.md`
- `docs/deployment-v2-implementation-plan.md`
- `docs/deployment-vps.md`
- `docs/deployment-tarball-flow.md`
- `docs/deployment-v3-plan.md`
- `docs/deployment-v3-implementation.md`
- `docs/examples/` — superseded by targets/sample

## Document notes

### docs/architecture.md

Rewrite of system-design.md. Keep goals, non-goals, component summary, filesystem layout, runtime model, deployment styles. Drop verbose implementation-level detail and anything now covered by other docs (CGI response params, submission payload encoding, etc.).

### docs/configuration.md

Based on deployment-targets.md. Sections:
- targets/ directory layout (target-name dir, target.json, surveys/ subdirs with survey.json + template.html)
- target.json field reference (all required and type-specific keys, path rules)
- survey files: survey.json placement, template.html, optional custom CSS/JS

### docs/deployment.md

- packaging: `npm run package:target -- <target-folder>` and `npm run package:survey -- <survey-folder>`
- what `deploy/<targetName>/` contains: deploy.sh, package.tar.gz, files/
- deploying: running deploy.sh for SSH (streams tarball via `ssh tar xPzvf -`) and container (`docker exec`)

### docs/generator.md (update)

Add survey.json structure: sections/questions schema, question types and their content shapes. Ensure snippet override and custom CSS/JS append docs are current. Keep generate command example pointing at targets/sample.

### docs/survey-page.md

Browser-side features with feature spec coverage:
- local storage: scope (page URL), persistence rules, expiry (one month), submit behavior
- association linker: mouse/touch drag and keyboard interaction

### docs/plans/survey-tabs.md

Moved from survey-tabs-design.md. Add note: tabs are one planned alternative page template among potentially several future layout options.

### docs/plans/testing-refactor.md

Moved from testing-refactor.md. Update TODO.md reference from old path.

### README.md

- One paragraph: what the project is
- Quickstart: `npm test`, generate a survey page, run a container with the sample target
- Pointers to: architecture.md, generator.md, configuration.md, deployment.md, survey-page.md, testing.md
