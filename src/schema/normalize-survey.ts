import type {
  AssociativeQuestion,
  MultiChoiceQuestion,
  Survey,
  SurveyQuestion,
  SingleChoiceQuestion
} from './survey'

type NormalizedTextItem = {
  id: string
  text: string
}

type NormalizedQuestionBase = {
  id: string
  title: string
  description?: string
}

export type NormalizedSingleChoiceQuestion = NormalizedQuestionBase & {
  type: 'single-choice'
  content: NormalizedTextItem[]
}

export type NormalizedMultiChoiceQuestion = NormalizedQuestionBase & {
  type: 'multi-choice'
  content: NormalizedTextItem[]
}

export type NormalizedFreeTextQuestion = NormalizedQuestionBase & {
  type: 'free-text'
}

export type NormalizedAssociativeQuestion = NormalizedQuestionBase & {
  type: 'associative'
  content: {
    left: NormalizedTextItem[]
    right: NormalizedTextItem[]
  }
}

export type NormalizedQuestion =
  | NormalizedSingleChoiceQuestion
  | NormalizedMultiChoiceQuestion
  | NormalizedFreeTextQuestion
  | NormalizedAssociativeQuestion

export type NormalizedSection = {
  id: string
  title: string
  description?: string
  questions: NormalizedQuestion[]
}

export type NormalizedSurvey = {
  title: string
  description?: string
  protected?: boolean
  sections: NormalizedSection[]
}

function normalizeTextRecord(record: Record<string, string>): NormalizedTextItem[] {
  return Object.entries(record).map(([id, text]) => ({
    id,
    text
  }))
}

function normalizeSingleChoiceQuestion(
  id: string,
  question: SingleChoiceQuestion
): NormalizedSingleChoiceQuestion {
  return {
    id,
    title: question.title,
    type: question.type,
    content: normalizeTextRecord(question.content),
    ...(question.description ? { description: question.description } : {})
  }
}

function normalizeMultiChoiceQuestion(
  id: string,
  question: MultiChoiceQuestion
): NormalizedMultiChoiceQuestion {
  return {
    id,
    title: question.title,
    type: question.type,
    content: normalizeTextRecord(question.content),
    ...(question.description ? { description: question.description } : {})
  }
}

function normalizeAssociativeQuestion(
  id: string,
  question: AssociativeQuestion
): NormalizedAssociativeQuestion {
  return {
    id,
    title: question.title,
    type: question.type,
    content: {
      left: normalizeTextRecord(question.content.left),
      right: normalizeTextRecord(question.content.right)
    },
    ...(question.description ? { description: question.description } : {})
  }
}

function normalizeQuestion(id: string, question: SurveyQuestion): NormalizedQuestion {
  switch (question.type) {
    case 'single-choice':
      return normalizeSingleChoiceQuestion(id, question)
    case 'multi-choice':
      return normalizeMultiChoiceQuestion(id, question)
    case 'free-text':
      return {
        id,
        title: question.title,
        type: question.type,
        ...(question.description ? { description: question.description } : {})
      }
    case 'associative':
      return normalizeAssociativeQuestion(id, question)
  }
}

export function normalizeSurvey(survey: Survey): NormalizedSurvey {
  return {
    title: survey.title,
    sections: Object.entries(survey.sections).map(([id, section]) => ({
      id,
      title: section.title,
      questions: Object.entries(section.questions ?? {}).map(([questionId, question]) =>
        normalizeQuestion(questionId, question)
      ),
      ...(section.description ? { description: section.description } : {})
    })),
    ...(survey.protected !== undefined ? { protected: survey.protected } : {}),
    ...(survey.description ? { description: survey.description } : {})
  }
}
