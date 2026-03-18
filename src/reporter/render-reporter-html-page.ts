import type { Survey } from '../schema/survey'

import type { ReporterQuestionStatistics } from './build-reporter-statistics'

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function renderQuestion(question: ReporterQuestionStatistics): string {
  switch (question.type) {
    case 'single-choice':
    case 'multi-choice':
      return [
        `<section data-question="${escapeHtml(question.id)}">`,
        `<h3>${escapeHtml(question.title)}</h3>`,
        '<ul>',
        ...question.options.map((option) => renderBarItem(option.text, option.count, option.percentage)),
        '</ul>',
        '</section>'
      ].join('')
    case 'free-text':
      return [
        `<section data-question="${escapeHtml(question.id)}">`,
        `<h3>${escapeHtml(question.title)}</h3>`,
        '<ul>',
        ...question.answers.map((answer) => renderBarItem(answer.value, answer.count, answer.percentage)),
        '</ul>',
        '</section>'
      ].join('')
    case 'associative':
      return [
        `<section data-question="${escapeHtml(question.id)}">`,
        `<h3>${escapeHtml(question.title)}</h3>`,
        '<ul>',
        ...question.pairs.map((pair) => renderBarItem(pair.key, pair.count, pair.percentage)),
        '</ul>',
        '</section>'
      ].join('')
  }
}

function renderBarItem(label: string, count: number, percentage: number): string {
  return [
    '<li>',
    `<div data-bar-chart>`,
    `<span>${escapeHtml(label)}: ${count} (${percentage}%)</span>`,
    `<div style="background: #dbeafe; border-radius: 999px; height: 0.75rem; margin-top: 0.25rem; overflow: hidden;">`,
    `<div style="background: #2563eb; height: 100%; width: ${percentage}%"></div>`,
    '</div>',
    '</div>',
    '</li>'
  ].join('')
}

export function renderReporterHtmlPage(input: {
  surveyName: string
  survey: Survey
  statistics: {
    respondentCount: number
    questions: ReporterQuestionStatistics[]
    groupedResults?: Array<{
      key: string
      respondentCount: number
      recipientPercentage?: number
    }>
  }
}): string {
  return [
    '<!DOCTYPE html>',
    '<html>',
    '<head>',
    `<title>${escapeHtml(input.survey.title)} report</title>`,
    '</head>',
    '<body>',
    `<h1>${escapeHtml(input.survey.title)}</h1>`,
    `<p>Survey name: ${escapeHtml(input.surveyName)}</p>`,
    `<p>Respondents: ${input.statistics.respondentCount}</p>`,
    ...input.statistics.questions.map((question) => renderQuestion(question)),
    ...(input.statistics.groupedResults
      ? [
          '<section data-grouped-results>',
          '<h2>Grouped results</h2>',
          '<ul>',
          ...input.statistics.groupedResults.map((group) =>
            renderBarItem(
              group.key,
              group.respondentCount,
              group.recipientPercentage ?? group.respondentCount
            )
          ),
          '</ul>',
          '</section>'
        ]
      : []),
    '</body>',
    '</html>'
  ].join('')
}
