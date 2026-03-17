import { createHash } from 'node:crypto'

type CgiRequestHeaders = Record<string, string | undefined>

export function deriveRespondentAnswerFilename(
  headers: CgiRequestHeaders,
  deploymentSalt = ''
): string {
  const hashInput = JSON.stringify([
    headers.REMOTE_ADDR ?? '',
    headers.HTTP_USER_AGENT ?? '',
    headers.HTTP_ACCEPT_LANGUAGE ?? '',
    deploymentSalt
  ])
  const digest = createHash('sha256').update(hashInput).digest('hex')

  return `${digest}.json`
}
