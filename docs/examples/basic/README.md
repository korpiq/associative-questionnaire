# Basic example

This directory contains a minimal questionnaire JSON file and HTML template for the current generator.

## Files

- `questionnaire.json` is the keyed-object questionnaire input.
- `template.html` is the HTML template input.

## Generate example output

From the repository root, run:

```bash
npm run generate -- docs/examples/basic/questionnaire.json docs/examples/basic/template.html associative-questionnaire-example.html
```

The command prints the output path after writing the generated HTML file.

## View the result

Open `associative-questionnaire-example.html` in a browser to inspect the generated standalone questionnaire page.
