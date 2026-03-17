import { type AnswerFile, parseAnswerFile, type Survey } from '../schema/survey'
import {
  normalizeSurvey,
  type NormalizedAssociativeQuestion,
  type NormalizedFreeTextQuestion,
  type NormalizedMultiChoiceQuestion,
  type NormalizedQuestion,
  type NormalizedSingleChoiceQuestion
} from '../schema/normalize-survey'

export type BrowserFormFields = Record<string, string | string[]>

function normalizeSingleChoiceAnswer(
  question: NormalizedSingleChoiceQuestion,
  fieldValue: string | string[]
): AnswerFile['answers'][string] {
  if (Array.isArray(fieldValue)) {
    throw new Error(`Single-choice answer for question "${question.id}" must be one value`)
  }

  return {
    type: 'single-choice',
    value: fieldValue
  }
}

function normalizeMultiChoiceAnswer(
  fieldValue: string | string[]
): AnswerFile['answers'][string] {
  return {
    type: 'multi-choice',
    value: Array.isArray(fieldValue) ? fieldValue : [fieldValue]
  }
}

function normalizeFreeTextAnswer(
  question: NormalizedFreeTextQuestion,
  fieldValue: string | string[]
): AnswerFile['answers'][string] {
  if (Array.isArray(fieldValue)) {
    throw new Error(`Free-text answer for question "${question.id}" must be one value`)
  }

  return {
    type: 'free-text',
    value: fieldValue
  }
}

function normalizeAssociativeAnswer(
  question: NormalizedAssociativeQuestion,
  fieldValue: string | string[]
): AnswerFile['answers'][string] {
  if (Array.isArray(fieldValue)) {
    throw new Error(`Associative answer for question "${question.id}" must be one value`)
  }

  let parsedValue: unknown

  try {
    parsedValue = JSON.parse(fieldValue)
  } catch (_error) {
    throw new Error(`Associative answer for question "${question.id}" must be valid JSON`)
  }

  return {
    type: 'associative',
    value: parsedValue as Array<{ left: string; right: string }>
  }
}

function normalizeQuestionAnswer(
  question: NormalizedQuestion,
  fieldValue: string | string[]
): AnswerFile['answers'][string] {
  switch (question.type) {
    case 'single-choice':
      return normalizeSingleChoiceAnswer(question, fieldValue)
    case 'multi-choice':
      return normalizeMultiChoiceAnswer(fieldValue)
    case 'free-text':
      return normalizeFreeTextAnswer(question, fieldValue)
    case 'associative':
      return normalizeAssociativeAnswer(question, fieldValue)
  }
}

export function normalizeSurveyAnswerFields(
  survey: Survey,
  formFields: BrowserFormFields
): AnswerFile {
  const normalizedSurvey = normalizeSurvey(survey)
  const answers = Object.fromEntries(
    normalizedSurvey.sections.flatMap((section) =>
      section.questions.flatMap((question) => {
        const fieldValue = formFields[question.id]

        if (fieldValue === undefined) {
          return []
        }

        return [[question.id, normalizeQuestionAnswer(question, fieldValue)]]
      })
    )
  )

  return parseAnswerFile({
    surveyTitle: normalizedSurvey.title,
    answers
  })
}
