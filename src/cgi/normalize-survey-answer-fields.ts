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

  if (!question.content.some((option) => option.id === fieldValue)) {
    throw new Error(`Single-choice answer for question "${question.id}" must match a defined option`)
  }

  return {
    type: 'single-choice',
    value: fieldValue
  }
}

function normalizeMultiChoiceAnswer(
  question: NormalizedMultiChoiceQuestion,
  fieldValue: string | string[]
): AnswerFile['answers'][string] {
  const values = Array.isArray(fieldValue) ? fieldValue : [fieldValue]

  values.forEach((value) => {
    if (!question.content.some((option) => option.id === value)) {
      throw new Error(`Multi-choice answer for question "${question.id}" must match defined options`)
    }
  })

  return {
    type: 'multi-choice',
    value: values
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

  const associations = parsedValue as Array<{ left: string; right: string }>

  associations.forEach((association) => {
    if (!question.content.left.some((phrase) => phrase.id === association.left)) {
      throw new Error(
        `Associative answer for question "${question.id}" must match defined left-side phrases`
      )
    }

    if (!question.content.right.some((phrase) => phrase.id === association.right)) {
      throw new Error(
        `Associative answer for question "${question.id}" must match defined right-side phrases`
      )
    }
  })

  return {
    type: 'associative',
    value: associations
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
      return normalizeMultiChoiceAnswer(question, fieldValue)
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
