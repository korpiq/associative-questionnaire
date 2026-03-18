# Associative survey

Survey system based on single HTML page. Main feature is presenting a group of phrases that the user answering the survey should link with matching phrases in another group.

Client-side scripting must be kept to minimum and done in javascript compatible with major browsers for both desktop and mobile. Styles should be progressive.

## Design

1. Generator that produces a standalone HTML page from a HTML template and survey JSON.
   - should generate a concise and straightforward HTML page that contains all styles and javascript necessary for a smooth, progressive user experience.
2. CGI script that stores the results of any survey forms to JSON files on same server.
3. Reporter that produces a statistical report from a survey and associated answer files.

The actual application seen by users is the generated HTML page that stores the answers via the CGI script.

Scripts outside browser (generator reporter) can be implemented in Typescript for nodejs version 20. CGI script must be plain javascript.

### Survey content as JSON data structure

Text in survey content may be markdown and/or HTML to allow images and nice layout.

Section and question lists in survey JSON are objects keyed by identifier. Presentation follows object key order in the source JSON.

- section list
  - identifier key for each section
  - title text
  - optional description text
  - optional question list
    - identifier key for each question
    - title text
    - optional description text
    - question type
    - content based on question type

#### Question types

- single-choice / multi-choice
  - content maps button values to textual descriptions
- free text
  - no initial content
- associative
  - left group: map of single digit values to textual descriptions
  - right group: map of single letter values to textual descriptions

### HTML template

- repeatable element to use for each section
  - placeholders for title and description
  - repeatable element to use for each question
    - repeatable element for each content item per question type

### Survey HTML page generator

Parameters
- Survey content file
- HTML template file
Outputs
- HTML survey generated from HTML template by survey content.

See `docs/generator.md` for the current planned usage flow and constraints.
See `docs/try-it-out.md` for current manual tryout commands.

### Survey results saver CGI script

Results saver CGI script
- receives survey answers when the form in the HTML page is submitted
- stores them in separate JSON files under directory `survey/<survey-title>`.
- identifies repeat submissions by a month-long random cookie set on the first successful save
- stores one JSON file per survey per cookie value, replacing the same file on later saves from that browser

### Survey reporter

Parameters
- Survey content file
- Answer files
- Optional number of recipients asked to answer the survey
- Optional list of question identifiers to group answers by for statistics
- Optional identifiers for answers that are not scored (e.g. because ambiguity)
Outputs
- statistics of answers per group and combination of groups
- totals
- percentages
- graphs in e.g. mermaid

See `docs/system-design.md` for the current combined deployment and runtime design of generated pages, the CGI saver, and the reporter.
See `docs/try-it-out.md` for current manual generator and saver tryout commands.
See `docs/deployment-vps.md` for the current VPS deployment flow.

### HTML template snippets

Utility snippets to include in the HTML template for representation of different parts.

The snippets can be combined into a "HTML template sample" file.

### Association linker

Associative questions have two groups of phrases. Phrases are shown as boxes containing the phrase. One group is to the left of screen, the other to the right.

User can associate phrases by
- by mouse or touch by clicking on one and dragging from it to another
- by keyboard by tabbing to a phrase and then pressing the letter identifying the phrase to associate.

Each phrase can be connected to any number of phrases in the other group.

Associations can be removed by choosing them again.

## Feature specifications

All features are specified as Gherkin ("Give-When-Then") under `tests/feature` in files with appropriate names.

Only features described there are considered as supported.

## Tests

Tests are written with `@amiceli/vitest-cucumber` under `tests/feature/specs` in files associated with the feature specification files by name.

See `docs/testing.md` for the current project testing method and step-structure conventions.

Tests are written as `@amiceli/vitest-cucumber` says:

```typescript
import { loadFeature, describeFeature } from '@amiceli/vitest-cucumber'
import { expect } from 'vitest'

const feature = await loadFeature('path/to/my/file.feature')

describeFeature(feature, ({ Scenario }) => {
    let answerFilename = '';
    let answers: Record<string, string> = {};
    let report: object = {};

    Scenario('sample Gherkin spec', ({ Given, When, Then, And }) => {
        Given('Answers are stored in file {givenFilename}', (_ctx, givenFilename ) => {
          answerFilename = givenFilename;
        })
        And('Answer to {string} is {string}', (_ctx, question, answer) => {
            answers[question] = answer;
        })
        When('Survey report is generated', () => {
          // first complete the setup descibed above
          fs.writeFileSync(answerFilename, JSON.stringify(answers));
          // proceed to do what the spec line says
          report = reportSurveyResults(survey, [answerFilename]);
        })
        Then('Report contains results of one answer', () => {
          expect(report.answers.count).toEqual(1);
        })
    })

})
```

## Data integrity

We use Zod schemas to verify data integrity.

## Anonymity

We avoid doing anything identifying the users. A survey may or may not contain questions to identify users.

Note that each step must do exactly what its Gherkin description says. If not otherwise applicable, they must populate a shared variable that is then used in a later step to actually execute the setup built by earlier steps.
