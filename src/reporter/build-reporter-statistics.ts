import type { AnswerFile, Survey } from '../schema/survey'
import {
  normalizeSurvey,
  type NormalizedAssociativeQuestion,
  type NormalizedFreeTextQuestion,
  type NormalizedMultiChoiceQuestion,
  type NormalizedQuestion,
  type NormalizedSingleChoiceQuestion
} from '../schema/normalize-survey'

type CountEntry = {
  count: number
  percentage: number
}

type CorrectnessEntry = {
  correctCount: number
  incorrectCount: number
  correctPercentage: number
  incorrectPercentage: number
}

type ReporterSingleChoiceStats = {
  id: string
  title: string
  type: 'single-choice'
  answeredCount: number
  correctness?: CorrectnessEntry
  options: Array<{
    id: string
    text: string
  } & CountEntry>
}

type ReporterMultiChoiceStats = {
  id: string
  title: string
  type: 'multi-choice'
  answeredCount: number
  correctness?: CorrectnessEntry
  options: Array<{
    id: string
    text: string
  } & CountEntry>
}

type ReporterFreeTextStats = {
  id: string
  title: string
  type: 'free-text'
  answeredCount: number
  correctness?: CorrectnessEntry
  answers: Array<{
    value: string
  } & CountEntry>
}

type ReporterAssociativeStats = {
  id: string
  title: string
  type: 'associative'
  answeredCount: number
  correctness?: CorrectnessEntry
  pairs: Array<{
    key: string
    left: string
    right: string
  } & CountEntry>
}

export type ReporterQuestionStatistics =
  | ReporterSingleChoiceStats
  | ReporterMultiChoiceStats
  | ReporterFreeTextStats
  | ReporterAssociativeStats

export function buildReporterStatistics(
  survey: Survey,
  answerFiles: AnswerFile[]
): {
  respondentCount: number
  questions: ReporterQuestionStatistics[]
} {
  const normalizedSurvey = normalizeSurvey(survey)
  const respondentCount = answerFiles.length

  return {
    respondentCount,
    questions: normalizedSurvey.sections.flatMap((section) =>
      section.questions.map((question) =>
        buildQuestionStatistics(question, answerFiles, respondentCount)
      )
    )
  }
}

function percentage(count: number, total: number): number {
  if (total === 0) {
    return 0
  }

  return (count / total) * 100
}

function buildQuestionStatistics(
  question: NormalizedQuestion,
  answerFiles: AnswerFile[],
  respondentCount: number
): ReporterQuestionStatistics {
  switch (question.type) {
    case 'single-choice':
      return buildSingleChoiceStatistics(question, answerFiles, respondentCount)
    case 'multi-choice':
      return buildMultiChoiceStatistics(question, answerFiles, respondentCount)
    case 'free-text':
      return buildFreeTextStatistics(question, answerFiles, respondentCount)
    case 'associative':
      return buildAssociativeStatistics(question, answerFiles, respondentCount)
  }
}

function buildSingleChoiceStatistics(
  question: NormalizedSingleChoiceQuestion,
  answerFiles: AnswerFile[],
  respondentCount: number
): ReporterSingleChoiceStats {
  const answers = answerFiles
    .map((answerFile) => answerFile.answers[question.id])
    .filter((answer) => answer?.type === 'single-choice')
  const answeredCount = answers.length

  return {
    id: question.id,
    title: question.title,
    type: 'single-choice',
    answeredCount,
    ...(question.correct
      ? { correctness: buildCorrectnessEntry(answers, respondentCount, (answer) => answer.value === question.correct) }
      : {}),
    options: question.content.map((option) => {
      const count = answers.filter((answer) => answer.value === option.id).length

      return {
        id: option.id,
        text: option.text,
        count,
        percentage: percentage(count, respondentCount)
      }
    })
  }
}

function buildMultiChoiceStatistics(
  question: NormalizedMultiChoiceQuestion,
  answerFiles: AnswerFile[],
  respondentCount: number
): ReporterMultiChoiceStats {
  const answers = answerFiles
    .map((answerFile) => answerFile.answers[question.id])
    .filter((answer) => answer?.type === 'multi-choice')
  const answeredCount = answers.length

  return {
    id: question.id,
    title: question.title,
    type: 'multi-choice',
    answeredCount,
    ...(question.correct
      ? {
          correctness: buildCorrectnessEntry(
            answers,
            respondentCount,
            (answer) => isExactIdentifierSet(answer.value, question.correct ?? [])
          )
        }
      : {}),
    options: question.content.map((option) => {
      const count = answers.filter((answer) => answer.value.includes(option.id)).length

      return {
        id: option.id,
        text: option.text,
        count,
        percentage: percentage(count, respondentCount)
      }
    })
  }
}

function buildFreeTextStatistics(
  question: NormalizedFreeTextQuestion,
  answerFiles: AnswerFile[],
  respondentCount: number
): ReporterFreeTextStats {
  const answers = answerFiles
    .map((answerFile) => answerFile.answers[question.id])
    .filter((answer) => answer?.type === 'free-text')
  const answeredCount = answers.length
  const counts = new Map<string, number>()

  answers.forEach((answer) => {
    counts.set(answer.value, (counts.get(answer.value) ?? 0) + 1)
  })

  return {
    id: question.id,
    title: question.title,
    type: 'free-text',
    answeredCount,
    ...(question.correct
      ? {
          correctness: buildCorrectnessEntry(
            answers,
            respondentCount,
            (answer) => question.correct?.includes(answer.value) ?? false
          )
        }
      : {}),
    answers: Array.from(counts.entries()).map(([value, count]) => ({
      value,
      count,
      percentage: percentage(count, respondentCount)
    }))
  }
}

function buildAssociativeStatistics(
  question: NormalizedAssociativeQuestion,
  answerFiles: AnswerFile[],
  respondentCount: number
): ReporterAssociativeStats {
  const answers = answerFiles
    .map((answerFile) => answerFile.answers[question.id])
    .filter((answer) => answer?.type === 'associative')
  const answeredCount = answers.length
  const counts = new Map<string, { left: string; right: string; count: number }>()

  answers.forEach((answer) => {
    answer.value.forEach((pair) => {
      const key = `${pair.left}:${pair.right}`
      const current = counts.get(key)

      if (current) {
        current.count += 1
        return
      }

      counts.set(key, {
        left: pair.left,
        right: pair.right,
        count: 1
      })
    })
  })

  return {
    id: question.id,
    title: question.title,
    type: 'associative',
    answeredCount,
    ...(question.correct
      ? {
          correctness: buildCorrectnessEntry(
            answers,
            respondentCount,
            (answer) => isExactPairSet(answer.value, question.correct ?? [])
          )
        }
      : {}),
    pairs: Array.from(counts.entries()).map(([key, entry]) => ({
      key,
      left: entry.left,
      right: entry.right,
      count: entry.count,
      percentage: percentage(entry.count, respondentCount)
    }))
  }
}

function buildCorrectnessEntry<TAnswer extends { value: unknown }>(
  answers: TAnswer[],
  respondentCount: number,
  isCorrect: (answer: TAnswer) => boolean
): CorrectnessEntry {
  const correctCount = answers.filter((answer) => isCorrect(answer)).length
  const incorrectCount = answers.length - correctCount

  return {
    correctCount,
    incorrectCount,
    correctPercentage: percentage(correctCount, respondentCount),
    incorrectPercentage: percentage(incorrectCount, respondentCount)
  }
}

function isExactIdentifierSet(left: string[], right: string[]): boolean {
  if (left.length !== right.length) {
    return false
  }

  const leftSorted = [...left].sort()
  const rightSorted = [...right].sort()

  return leftSorted.every((value, index) => value === rightSorted[index])
}

function isExactPairSet(
  left: Array<{ left: string; right: string }>,
  right: Array<{ left: string; right: string }>
): boolean {
  if (left.length !== right.length) {
    return false
  }

  const leftSorted = left
    .map((pair) => `${pair.left}:${pair.right}`)
    .sort()
  const rightSorted = right
    .map((pair) => `${pair.left}:${pair.right}`)
    .sort()

  return leftSorted.every((value, index) => value === rightSorted[index])
}
