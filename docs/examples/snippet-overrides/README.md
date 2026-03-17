# Snippet override example

This directory contains a runnable survey example that overrides every built-in HTML snippet partial:

- `root`
- `section`
- `question`
- `style`
- `script`

## Files

- `survey.json` is the keyed-object survey input.
- `template.html` defines inline `handlebars` partials that replace all five default snippets.

## Generate example output

From the repository root, run:

```bash
npm run generate -- docs/examples/snippet-overrides/survey.json docs/examples/snippet-overrides/template.html associative-survey-snippet-overrides.html https://example.test/cgi-bin/save-survey.js
```

The command prints the output path after writing the generated HTML file.

## What to inspect

- The page shell comes from the `root` override.
- Section headings and wrappers come from the `section` override.
- Question headings and content wrappers come from the `question` override.
- The banner colors and spacing come from the `style` override.
- The `data-snippet-demo="ready"` marker on `<html>` comes from the `script` override.
