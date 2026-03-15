# Generator

## Purpose

The generator produces the standalone questionnaire HTML page that users actually open and submit.

## Inputs

- A questionnaire JSON file that follows the keyed-object schema described in `README.md`.
- An HTML template file that contains the repeatable section, question, and content fragments.

## Output

- One standalone HTML document generated from the questionnaire JSON and template.
- The generated page must include the styles and browser-side JavaScript it needs, with no extra runtime dependency on a build step or framework.

## Expected flow

1. Read and validate the questionnaire JSON.
2. Read the HTML template.
3. Expand sections and questions in source order from the keyed objects.
4. Render question content according to the question type.
5. Inline the styles and browser JavaScript needed for progressive behavior.
6. Emit the final HTML file.

## Current constraints

- Browser-side scripting must stay minimal.
- Browser JavaScript must stay compatible with major desktop and mobile browsers.
- The resulting page should be concise, straightforward, and smooth to use.
- The generated page is the application surface that later submits answers to the CGI saver.

## Example

See `docs/examples/basic/README.md` for a runnable example with a questionnaire JSON file, template HTML file, and a command that writes a generated questionnaire page.

## Snippet overrides

The generator registers default `handlebars` partials named `root`, `section`, `question`, `style`, and `script`.

An HTML template can override any of them with inline partials and then render `{{> root}}`.
