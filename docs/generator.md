# Generator

## Purpose

The generator produces the standalone survey HTML page that users actually open and submit.

## Inputs

- A survey JSON file that follows the keyed-object schema described in `README.md`.
- An HTML template file that contains the repeatable section, question, and content fragments.
- A saver CGI form-action URL that the generated page posts to with native browser form submission.

## Output

- One standalone HTML document generated from the survey JSON and template.
- The generated page includes a POST form action that appends the derived `surveyName` from the survey filename.
- The generated page must include the styles and browser-side JavaScript it needs, with no extra runtime dependency on a build step or framework.

## Expected flow

1. Read and validate the survey JSON.
2. Read the HTML template.
3. Derive `surveyName` from the survey JSON filename.
4. Expand sections and questions in source order from the keyed objects.
5. Render question content according to the question type.
6. Inline the styles and browser JavaScript needed for progressive behavior.
7. Emit the final HTML file with a submit button and POST form action ready for the shared CGI saver.

## Current constraints

- Browser-side scripting must stay minimal.
- Browser JavaScript must stay compatible with major desktop and mobile browsers.
- The resulting page should be concise, straightforward, and smooth to use.
- The generated page is the application surface that later submits answers to the CGI saver.

## Example

See `docs/examples/basic/README.md` for a runnable default-template example.
See `docs/examples/snippet-overrides/README.md` for a runnable example that overrides every built-in snippet partial.

## Snippet overrides

The generator registers default `handlebars` partials named `root`, `section`, `question`, `style`, and `script`.

An HTML template can override any of them with inline partials and then render `{{> root}}`.
