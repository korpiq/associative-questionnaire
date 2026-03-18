import { randomBytes } from 'node:crypto'

const RESPONDENT_COOKIE_NAME = 'associativeSurveyRespondentId'
const RESPONDENT_COOKIE_MAX_AGE = 60 * 60 * 24 * 30

function parseCookieHeader(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) {
    return {}
  }

  return Object.fromEntries(
    cookieHeader
      .split(';')
      .map((part) => part.trim())
      .filter((part) => part.length > 0)
      .map((part) => {
        const separatorIndex = part.indexOf('=')

        if (separatorIndex < 0) {
          return [part, '']
        }

        return [part.slice(0, separatorIndex), part.slice(separatorIndex + 1)]
      })
  )
}

function buildSetCookieHeader(respondentId: string): string {
  return [
    `${RESPONDENT_COOKIE_NAME}=${respondentId}`,
    `Max-Age=${RESPONDENT_COOKIE_MAX_AGE}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax'
  ].join('; ')
}

export function resolveRespondentCookie(cookieHeader: string | undefined): {
  respondentId: string
  setCookieHeader?: string
} {
  const parsedCookies = parseCookieHeader(cookieHeader)
  const existingRespondentId = parsedCookies[RESPONDENT_COOKIE_NAME]

  if (existingRespondentId && /^[a-f0-9]{32}$/.test(existingRespondentId)) {
    return {
      respondentId: existingRespondentId
    }
  }

  const respondentId = randomBytes(16).toString('hex')

  return {
    respondentId,
    setCookieHeader: buildSetCookieHeader(respondentId)
  }
}
