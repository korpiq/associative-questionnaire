# Generator

## Purpose

The generator produces the standalone survey HTML page that users open and submit.

## Command

```bash
npm run generate -- <survey.json> <template.html> <output.html> <saver-url>
```

Example using the sample survey:

```bash
npm run generate -- targets/sample/surveys/survey/survey.json targets/sample/surveys/survey/template.html survey.html https://example.test/cgi-bin/survey/save.cgi
```

The command writes the generated HTML file and prints its path.

## Inputs

- **survey JSON** — survey content following the schema below.
- **HTML template** — Handlebars template using the partials described below.
- **saver URL** — the `save.cgi` URL the generated page will POST to.

## Survey JSON Schema

```json
{
  "title": "Survey title",
  "description": "Optional description",
  "sections": {
    "<sectionId>": {
      "title": "Section title",
      "description": "Optional section description",
      "questions": {
        "<questionId>": {
          "title": "Question title",
          "description": "Optional question description",
          "type": "<question-type>",
          "content": "<see question types below>"
        }
      }
    }
  }
}
```

Sections and questions are keyed objects. Presentation follows object key order in the source JSON. `sectionId` and `questionId` are used as stable identifiers for storage and reporting.

### Question Types

**single-choice** — one option may be selected:

```json
{
  "type": "single-choice",
  "content": { "red": "Red", "blue": "Blue" }
}
```

**multi-choice** — any number of options may be selected:

```json
{
  "type": "multi-choice",
  "content": { "music": "Music", "sports": "Sports" }
}
```

**free-text** — open text entry, no content field needed:

```json
{
  "type": "free-text"
}
```

**associative** — two groups of phrases; users draw connections between them:

```json
{
  "type": "associative",
  "content": {
    "left": { "1": "Calm", "2": "Energetic" },
    "right": { "A": "Blue", "B": "Red" }
  }
}
```

Left keys are single digits; right keys are single letters.

### Correctness

Any question may optionally define correct answers for scoring by the reporter:

```json
{
  "type": "single-choice",
  "content": { "red": "Red", "blue": "Blue" },
  "correct": "blue"
}
```

Correct answer shapes by type:
- `single-choice`: one option id string
- `multi-choice`: array of option id strings
- `free-text`: array of accepted exact answer strings
- `associative`: array of `{ "left": "1", "right": "A" }` pair objects

Questions without `correct` still report response statistics; questions with `correct` also report correct/incorrect counts.

## Output

One standalone HTML document. The page:
- includes all styles and browser-side JavaScript inline — no external runtime dependencies
- sets the form `action` to the configured saver URL
- derives `surveyName` from the survey JSON filename (without `.json`) and appends it to the form action

## HTML Template and Snippet Overrides

The generator registers default Handlebars partials. The minimum template is:

```html
{{> root}}
```

Default partials: `root`, `section`, `question`, `style`, `script`.

Any partial can be overridden inline in the template:

```html
{{#*inline "section"}}
  <section data-section="{{id}}">
    <h2>{{title}}</h2>
    {{#each questions}}{{> question}}{{/each}}
  </section>
{{/inline}}
{{> root}}
```

## Custom CSS and JavaScript

One custom CSS file and one custom JavaScript file can be appended to the defaults:

- custom CSS is emitted after the default styles
- custom JavaScript is emitted after the default scripts

This append-only behavior means later rules in custom assets override earlier defaults through normal CSS and JavaScript ordering. Named replacement or function-body patching are not supported.
