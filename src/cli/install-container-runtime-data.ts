import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

type ContainerTargetSettingsManifest = {
  surveys: Array<{
    surveyName: string
    privateSurveyPath: string
    privateAnswersDir: string
  }>
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
  const generatedSurveyRoot = join(generatedRoot, 'runtime', 'surveys')
  const generatedAnswersRoot = join(generatedRoot, 'runtime', 'answers')

  manifest?.surveys.forEach((survey) => {
    mkdirSync(dirname(survey.privateSurveyPath), { recursive: true })
    mkdirSync(survey.privateAnswersDir, { recursive: true })
    copyFileSync(
      join(generatedSurveyRoot, `${survey.surveyName}.json`),
      survey.privateSurveyPath
    )

    const seededSurveyAnswersRoot = join(generatedAnswersRoot, survey.surveyName)
    if (existsSync(seededSurveyAnswersRoot)) {
      cpSync(seededSurveyAnswersRoot, survey.privateAnswersDir, { recursive: true })
    }
  })
}

main()
