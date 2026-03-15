# Associative questionnaire

Questionnaire system based on single HTML page. Main feature is presenting a group of phrases that the user answering the questionnaire should link with matching phrases in another group.

Client-side scripting must be kept to minimum and done in javascript compatible with major browsers for both desktop and mobile. Styles should be progressive.

## Design

Scripts outside browser (generator, reporter) can be implemented in Typescript for nodejs version 20.

### Questionnaire content as JSON data structure

Text in questionnaire content may be markdown and/or HTML to allow images and nice layout.

Lists can be arrays or objects with single word keys to identify each value. Presentation follows order of items in the list.

- section list
  - title text
  - optional description text
  - optional question list
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

### Questionnaire HTML page generator

Parameters
- Questionnaire content file
- HTML template file
Outputs
- HTML questionnaire generated from HTML template by Questionnaire content.

### Questionnaire results saver CGI script

Results saver CGI script
- receives questionnaire answers when the form in the HTML page is submitted
- stores them in separate JSON files under directory `questionnaire/<questionnaire-title>`.
- Filename should be a one-way hash of some headers identifying the calling browser, so same user on same device with same browser would save to same file, but others to others.
- It is ok to produce separate files if user saves from a different IP address.

### Questionnaire reporter

Parameters
- Questionnaire content file
- Answer files
- Optional number of recipients asked to answer the questionnaire
- Optional list of question identifiers to group answers by for statistics
- Optional identifiers for answers that are not scored (e.g. because ambiguity)
Outputs
- statistics of answers per group and combination of groups
- totals
- percentages
- graphs in e.g. mermaid

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
        When('Questionnaire report is generated', () => {
          // first complete the setup descibed above
          fs.writeFileSync(answerFilename, JSON.stringify(answers));
          // proceed to do what the spec line says
          report = reportQuestionnaireResults(questionnaire, [answerFilename]);
        })
        Then('Report contains results of one answer', () => {
          expect(report.answers.count).toEqual(1);
        })
    })

})
```

Note that each step must do exactly what its Gherkin description says. If not otherwise applicable, they must populate a shared variable that is then used in a later step to actually execute the setup built by earlier steps.
