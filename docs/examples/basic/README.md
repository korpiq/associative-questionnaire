# Basic example

This directory contains a minimal survey JSON file and HTML template for the current generator.

## Files

- `survey.json` is the keyed-object survey input.
- `template.html` is the HTML template input.

## Generate example output

From the repository root, run:

```bash
npm run generate -- docs/examples/basic/survey.json docs/examples/basic/template.html associative-survey-example.html https://example.test/cgi-bin/save-survey.js
```

The command prints the output path after writing the generated HTML file.

## View the result

Open `associative-survey-example.html` in a browser to inspect the generated standalone survey page.
