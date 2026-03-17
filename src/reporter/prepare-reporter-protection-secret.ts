import { randomBytes } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

const REPORTER_PROTECTION_SECRET_PLACEHOLDER = '__REPORTER_PROTECTION_SECRET__'

export function prepareReporterProtectionSecret(input: {
  reporterScriptTemplate: string
  deploymentWorkspaceDirectory: string
  storedSecretRelativePath?: string
}): {
  preparedReporterScript: string
  protectionSecret: string
  storedSecretFilePath: string
} {
  const protectionSecret = randomBytes(32).toString('hex')
  const storedSecretFilePath = join(
    input.deploymentWorkspaceDirectory,
    input.storedSecretRelativePath ?? '.deploy/reporter-protection-secret.txt'
  )

  mkdirSync(dirname(storedSecretFilePath), { recursive: true })
  writeFileSync(storedSecretFilePath, protectionSecret)

  return {
    preparedReporterScript: input.reporterScriptTemplate.replaceAll(
      REPORTER_PROTECTION_SECRET_PLACEHOLDER,
      protectionSecret
    ),
    protectionSecret,
    storedSecretFilePath
  }
}
