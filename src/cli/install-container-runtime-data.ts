import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

import { installGeneratedContainerRuntimeData } from '../deploy/install-generated-container-runtime-data'

type ContainerTargetSettingsManifest = {
  saverCgi: {
    surveysDataDir: string
    answersDataDir: string
  }
}

function readManifest(path: string): ContainerTargetSettingsManifest | undefined {
  if (!existsSync(path)) {
    return undefined
  }

  return JSON.parse(readFileSync(path, 'utf8')) as ContainerTargetSettingsManifest
}

function main(): void {
  const workspaceRoot = process.cwd()
  const generatedRoot = resolve(workspaceRoot, 'deploy/generated')
  const manifestPath = join(generatedRoot, 'container-target-settings.json')
  const manifest = readManifest(manifestPath)

  installGeneratedContainerRuntimeData({
    generatedSurveyRoot: join(generatedRoot, 'runtime', 'surveys'),
    generatedAnswersRoot: join(generatedRoot, 'runtime', 'answers'),
    surveysDataDir:
      manifest?.saverCgi.surveysDataDir ?? '/home/app/.local/share/associative-survey/surveys',
    answersDataDir:
      manifest?.saverCgi.answersDataDir ?? '/home/app/.local/share/associative-survey/answers'
  })
}

main()
