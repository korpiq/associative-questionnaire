# Snippet override example

This directory contains a runnable questionnaire example that overrides every built-in HTML snippet partial:

- `root`
- `section`
- `question`
- `style`
- `script`

## Files

- `questionnaire.json` is the keyed-object questionnaire input.
- `template.html` defines inline `handlebars` partials that replace all five default snippets.

## Generate example output

From the repository root, run:

```bash
npm run generate -- docs/examples/snippet-overrides/questionnaire.json docs/examples/snippet-overrides/template.html associative-questionnaire-snippet-overrides.html
```

The command prints the output path after writing the generated HTML file.

## What to inspect

- The page shell comes from the `root` override.
- Section headings and wrappers come from the `section` override.
- Question headings and content wrappers come from the `question` override.
- The banner colors and spacing come from the `style` override.
- The `data-snippet-demo="ready"` marker on `<html>` comes from the `script` override.
