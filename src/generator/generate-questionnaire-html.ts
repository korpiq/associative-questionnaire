import Handlebars from 'handlebars'

import {
  type NormalizedAssociativeQuestion,
  type NormalizedFreeTextQuestion,
  type NormalizedMultiChoiceQuestion,
  type NormalizedQuestion,
  type NormalizedQuestionnaire,
  type NormalizedSingleChoiceQuestion,
  normalizeQuestionnaire
} from '../schema/normalize-questionnaire'
import type { Questionnaire } from '../schema/questionnaire'

const ROOT_TEMPLATE = `
<html>
<head><title>{{questionnaire.title}}</title></head>
<body>
<form>
{{#if questionnaire.description}}
<p>{{questionnaire.description}}</p>
{{/if}}
{{#each questionnaire.sections}}
{{> section}}
{{/each}}
</form>
</body>
</html>
`.trim()

const SECTION_TEMPLATE = `
<section data-section="{{id}}">
<h2>{{title}}</h2>
<p>{{description}}</p>
<div data-questions>
{{#each questions}}
{{> question}}
{{/each}}
</div>
</section>
`.trim()

const QUESTION_TEMPLATE = `
<article data-question="{{id}}">
<h3>{{title}}</h3>
<div data-content>{{{contentHtml}}}</div>
</article>
`.trim()

const BASE_STYLE = `
<style>
body { font-family: sans-serif; margin: 2rem auto; max-width: 60rem; padding: 0 1rem; }
form { display: grid; gap: 1.5rem; }
section, article { display: grid; gap: 0.75rem; }
.question-options, .associative-groups { display: grid; gap: 0.5rem; }
.associative-groups { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.phrase-list { display: grid; gap: 0.5rem; }
.phrase { border: 1px solid #bbb; border-radius: 0.5rem; padding: 0.75rem; }
</style>
`.trim()

const BASE_SCRIPT = `
<script>
document.documentElement.dataset.questionnaireReady = 'true';
</script>
`.trim()

function renderSingleChoiceContent(question: NormalizedSingleChoiceQuestion): string {
  const options = question.content
    .map(
      (option) => `
<label>
<input type="radio" name="${question.id}" value="${option.id}">
<span>${option.text}</span>
</label>
`.trim()
    )
    .join('')

  return `<div class="question-options" data-question-type="single-choice">${options}</div>`
}

function renderMultiChoiceContent(question: NormalizedMultiChoiceQuestion): string {
  const options = question.content
    .map(
      (option) => `
<label>
<input type="checkbox" name="${question.id}" value="${option.id}">
<span>${option.text}</span>
</label>
`.trim()
    )
    .join('')

  return `<div class="question-options" data-question-type="multi-choice">${options}</div>`
}

function renderFreeTextContent(question: NormalizedFreeTextQuestion): string {
  return `<textarea name="${question.id}" rows="4" data-question-type="free-text" aria-label="${question.title}"></textarea>`
}

function renderAssociativeGroup(title: string, phrases: Array<{ id: string; text: string }>): string {
  const items = phrases
    .map(
      (phrase) => `
<div class="phrase" data-phrase-id="${phrase.id}">
<span>${phrase.text}</span>
</div>
`.trim()
    )
    .join('')

  return `
<div class="phrase-list">
<h4>${title}</h4>
${items}
</div>
`.trim()
}

function renderAssociativeContent(question: NormalizedAssociativeQuestion): string {
  return `
<div class="associative-groups" data-question-type="associative">
${renderAssociativeGroup('Left', question.content.left)}
${renderAssociativeGroup('Right', question.content.right)}
</div>
`.trim()
}

function renderQuestionContent(question: NormalizedQuestion): string {
  switch (question.type) {
    case 'single-choice':
      return renderSingleChoiceContent(question)
    case 'multi-choice':
      return renderMultiChoiceContent(question)
    case 'free-text':
      return renderFreeTextContent(question)
    case 'associative':
      return renderAssociativeContent(question)
  }
}

function ensureStandaloneDocument(html: string): string {
  let standalone = html

  if (!standalone.startsWith('<!DOCTYPE html>')) {
    standalone = `<!DOCTYPE html>\n${standalone}`
  }

  if (!standalone.includes('<style>')) {
    standalone = standalone.replace('</head>', `${BASE_STYLE}\n</head>`)
  }

  if (!standalone.includes('<script>')) {
    standalone = standalone.replace('</body>', `${BASE_SCRIPT}\n</body>`)
  }

  return standalone
}

function isNormalizedQuestionnaire(
  questionnaire: Questionnaire | NormalizedQuestionnaire
): questionnaire is NormalizedQuestionnaire {
  return Array.isArray(questionnaire.sections)
}

function createRenderer(template: string): Handlebars.TemplateDelegate {
  const engine = Handlebars.create()
  engine.registerPartial('section', SECTION_TEMPLATE)
  engine.registerPartial('question', QUESTION_TEMPLATE)

  const source = template.trim().length > 0 ? template : ROOT_TEMPLATE
  return engine.compile(source)
}

type GeneratorQuestionView = NormalizedQuestion & {
  contentHtml: string
}

type GeneratorSectionView = Omit<NormalizedSection, 'questions'> & {
  questions: GeneratorQuestionView[]
}

type GeneratorQuestionnaireView = Omit<NormalizedQuestionnaire, 'sections'> & {
  sections: GeneratorSectionView[]
}

function toGeneratorView(questionnaire: NormalizedQuestionnaire): GeneratorQuestionnaireView {
  return {
    title: questionnaire.title,
    ...(questionnaire.description ? { description: questionnaire.description } : {}),
    sections: questionnaire.sections.map((section) => ({
      id: section.id,
      title: section.title,
      ...(section.description ? { description: section.description } : {}),
      questions: section.questions.map((question) => ({
        ...question,
        contentHtml: renderQuestionContent(question)
      }))
    }))
  }
}

export function generateQuestionnaireHtml(
  questionnaire: Questionnaire | NormalizedQuestionnaire,
  template: string
): string {
  const normalized = isNormalizedQuestionnaire(questionnaire)
    ? questionnaire
    : normalizeQuestionnaire(questionnaire)
  const render = createRenderer(template)
  const html = render({
    questionnaire: toGeneratorView(normalized)
  })

  return ensureStandaloneDocument(html)
}
