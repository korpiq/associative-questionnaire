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

function replaceTokens(template: string, values: Record<string, string>): string {
  return template.replace(/{{\s*([^}]+)\s*}}/g, (_match, token) => values[token] ?? '')
}

function readTemplateBlock(template: string, id: string): string {
  const pattern = new RegExp(`<template\\s+id="${id}">([\\s\\S]*?)<\\/template>`)
  const match = template.match(pattern)

  if (!match) {
    throw new Error(`Template block "${id}" is required`)
  }

  return match[1] ?? ''
}

function removeTemplateBlock(template: string, id: string): string {
  const pattern = new RegExp(`<template\\s+id="${id}">[\\s\\S]*?<\\/template>`)
  return template.replace(pattern, '')
}

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

function renderQuestion(question: NormalizedQuestion, questionTemplate: string): string {
  return replaceTokens(questionTemplate, {
    'question.id': question.id,
    'question.title': question.title,
    'question.content': renderQuestionContent(question)
  })
}

function renderSection(section: NormalizedSection, sectionTemplate: string, questionTemplate: string): string {
  const renderedQuestions = section.questions
    .map((question) => renderQuestion(question, questionTemplate))
    .join('')

  return replaceTokens(sectionTemplate, {
    'section.id': section.id,
    'section.title': section.title,
    'section.description': section.description ?? '',
    'section.questions': renderedQuestions
  })
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

function injectQuestionnaireDescription(html: string, description?: string): string {
  if (!description || html.includes(description)) {
    return html
  }

  if (html.includes('{{questionnaire.description}}')) {
    return html.replace('{{questionnaire.description}}', description)
  }

  if (html.includes('<form>')) {
    return html.replace('<form>', `<form>\n<p>${description}</p>`)
  }

  return html.replace('<body>', `<body>\n<p>${description}</p>`)
}

function isNormalizedQuestionnaire(
  questionnaire: Questionnaire | NormalizedQuestionnaire
): questionnaire is NormalizedQuestionnaire {
  return Array.isArray(questionnaire.sections)
}

export function generateQuestionnaireHtml(
  questionnaire: Questionnaire | NormalizedQuestionnaire,
  template: string
): string {
  const normalized = isNormalizedQuestionnaire(questionnaire)
    ? questionnaire
    : normalizeQuestionnaire(questionnaire)

  const sectionTemplate = readTemplateBlock(template, 'section')
  const questionTemplate = readTemplateBlock(template, 'question')
  const renderedSections = normalized.sections
    .map((section) => renderSection(section, sectionTemplate, questionTemplate))
    .join('')

  let html = template
  html = replaceTokens(html, {
    'questionnaire.title': normalized.title,
    'questionnaire.description': normalized.description ?? ''
  })
  html = html.replace(
    new RegExp(`<template\\s+id="section">[\\s\\S]*?<\\/template>`),
    renderedSections
  )
  html = removeTemplateBlock(html, 'question')
  html = injectQuestionnaireDescription(html, normalized.description)

  return ensureStandaloneDocument(html)
}
