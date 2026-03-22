import { resolve } from 'node:path'

import {
  resolveSurveyUrlPort,
  resolveTargetSurveySettings
} from '../deploy/resolve-target-survey-settings'

type SupportedField = 'publicUrl' | 'saveUrl' | 'reportUrl' | 'port'

function readArguments(argv: string[]): {
  targetName: string
  surveyName: string
  field: SupportedField
  workspaceDirectory: string
} {
  const targetName = argv[2]
  const surveyName = argv[3]
  const field = argv[4] as SupportedField | undefined
  const workspaceDirectory = argv[5] ? resolve(argv[5]) : process.cwd()

  if (
    !targetName ||
    !surveyName ||
    !field ||
    !['publicUrl', 'saveUrl', 'reportUrl', 'port'].includes(field)
  ) {
    throw new Error(
      'Usage: node --import tsx src/cli/read-target-survey-field.ts <target-name> <survey-name> <publicUrl|saveUrl|reportUrl|port> [workspace-directory]'
    )
  }

  return {
    targetName,
    surveyName,
    field,
    workspaceDirectory
  }
}

function main(): void {
  const { targetName, surveyName, field, workspaceDirectory } = readArguments(process.argv)
  const surveySettings = resolveTargetSurveySettings({
    workspaceDirectory,
    targetName,
    surveyName
  })

  if (field === 'port') {
    console.log(resolveSurveyUrlPort(surveySettings.publicUrl))
    return
  }

  console.log(surveySettings[field])
}

main()
