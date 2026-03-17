import type { AnswerFile, Survey } from '../schema/survey'

import {
  normalizeSurveyAnswerFields,
  type BrowserFormFields
} from './normalize-survey-answer-fields'

function addFormFieldValue(
  fields: BrowserFormFields,
  name: string,
  value: string
): void {
  const existingValue = fields[name]

  if (existingValue === undefined) {
    fields[name] = value
    return
  }

  if (Array.isArray(existingValue)) {
    existingValue.push(value)
    return
  }

  fields[name] = [existingValue, value]
}

function parseUrlEncodedFormFields(requestBody: string): BrowserFormFields {
  const fields: BrowserFormFields = {}
  const params = new URLSearchParams(requestBody)

  params.forEach((value, name) => {
    addFormFieldValue(fields, name, value)
  })

  return fields
}

export function normalizeSurveyAnswerRequestBody(
  survey: Survey,
  requestBody: string
): AnswerFile {
  return normalizeSurveyAnswerFields(survey, parseUrlEncodedFormFields(requestBody))
}
