import Handlebars from 'handlebars'
import { readFileSync } from 'node:fs'

import {
  type NormalizedAssociativeQuestion,
  type NormalizedFreeTextQuestion,
  type NormalizedMultiChoiceQuestion,
  type NormalizedQuestion,
  type NormalizedQuestionnaire,
  type NormalizedSection,
  type NormalizedSingleChoiceQuestion,
  normalizeQuestionnaire
} from '../schema/normalize-questionnaire'
import type { Questionnaire } from '../schema/questionnaire'

function readSnippet(filename: string): string {
  return readFileSync(new URL(`./snippets/${filename}`, import.meta.url), 'utf8').trim()
}

const ROOT_TEMPLATE = readSnippet('root.hbs')
const SECTION_TEMPLATE = readSnippet('section.hbs')
const QUESTION_TEMPLATE = readSnippet('question.hbs')
const BASE_STYLE = readSnippet('base-style.html')
const BASE_SCRIPT = readSnippet('base-script.html')

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
  const side = title.toLowerCase()
  const handleClass = side === 'left' ? 'phrase-handle phrase-handle-right' : 'phrase-handle phrase-handle-left'
  const items = phrases
    .map(
      (phrase) => `
<button type="button" class="phrase" data-phrase-id="${phrase.id}" data-side="${side}" aria-label="${phrase.id} ${phrase.text}">
<span class="${handleClass}" aria-hidden="true"></span>
<span class="phrase-box">
<span class="phrase-key">${phrase.id}</span>
<span>${phrase.text}</span>
</span>
</button>
`.trim()
    )
    .join('')

  return `
<div class="phrase-list" data-side="${side}">
<h4>${title}</h4>
${items}
</div>
`.trim()
}

function renderAssociativeContent(question: NormalizedAssociativeQuestion): string {
  return `
<div class="associative-groups" data-question-type="associative">
<svg class="associative-lines" aria-hidden="true">
<g data-stored-lines></g>
<line data-live-line hidden></line>
</svg>
<input type="hidden" name="${question.id}" value="[]" data-associations-input="${question.id}">
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
  engine.registerPartial('root', ROOT_TEMPLATE)
  engine.registerPartial('section', SECTION_TEMPLATE)
  engine.registerPartial('question', QUESTION_TEMPLATE)
  engine.registerPartial('style', BASE_STYLE)
  engine.registerPartial('script', BASE_SCRIPT)

  const source = template.trim().length > 0 ? template : '{{> root}}'
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
