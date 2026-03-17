import { createHash } from 'node:crypto'

export function deriveProtectedSurveyAccessHash(
  surveyName: string,
  protectionSecret: string
): string {
  return createHash('sha256').update(`${surveyName}${protectionSecret}`).digest('hex')
}
