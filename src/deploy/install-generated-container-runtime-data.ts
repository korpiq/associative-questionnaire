import { copyFileSync, cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs'
import { basename, join } from 'node:path'

export function installGeneratedContainerRuntimeData(input: {
  generatedSurveyRoot: string
  generatedAnswersRoot?: string
  surveysDataDir: string
  answersDataDir: string
}): void {
  mkdirSync(input.surveysDataDir, { recursive: true })
  mkdirSync(input.answersDataDir, { recursive: true })

  readdirSync(input.generatedSurveyRoot).forEach((filename) => {
    copyFileSync(join(input.generatedSurveyRoot, filename), join(input.surveysDataDir, basename(filename)))
  })

  if (input.generatedAnswersRoot && existsSync(input.generatedAnswersRoot)) {
    cpSync(input.generatedAnswersRoot, input.answersDataDir, { recursive: true })
  }
}
