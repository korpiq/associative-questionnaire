import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

import {
  parseDeploymentTargetConfig,
  type ParsedDeploymentTargetConfig
} from './parse-deployment-target-config'

export type LoadedDeploymentSurvey = {
  surveyName: string
  surveyDirectory: string
  surveyPath: string
  templatePath: string
}

export type LoadedDeploymentTarget = ParsedDeploymentTargetConfig & {
  targetDirectory: string
  surveys: LoadedDeploymentSurvey[]
}

function ensureTargetName(targetName: string): string {
  if (!targetName.trim()) {
    throw new Error('Target name must not be empty')
  }

  return targetName
}

export function loadDeploymentTarget(input: {
  workspaceDirectory: string
  targetName: string
}): LoadedDeploymentTarget {
  const targetName = ensureTargetName(input.targetName)
  const targetDirectory = resolve(input.workspaceDirectory, 'targets', targetName)
  const targetConfigurationPath = join(targetDirectory, 'target.json')

  if (!existsSync(targetConfigurationPath)) {
    throw new Error(
      `Deployment target configuration file was not found: targets/${targetName}/target.json`
    )
  }

  const parsedTarget = parseDeploymentTargetConfig({
    targetName,
    targetConfigurationJson: readFileSync(targetConfigurationPath, 'utf8')
  })
  const surveysDirectory = join(targetDirectory, 'surveys')
  const surveys = existsSync(surveysDirectory)
    ? readdirSync(surveysDirectory, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => {
          const surveyDirectory = join(surveysDirectory, entry.name)

          return {
            surveyName: entry.name,
            surveyDirectory,
            surveyPath: join(surveyDirectory, 'survey.json'),
            templatePath: join(surveyDirectory, 'template.html')
          }
        })
        .sort((left, right) => left.surveyName.localeCompare(right.surveyName))
    : []

  return {
    ...parsedTarget,
    targetDirectory,
    surveys
  }
}
