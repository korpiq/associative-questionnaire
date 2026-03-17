import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

import { generateSurveyHtml } from '../generator/generate-survey-html'
import { parseSurvey } from '../schema/survey'

function readArguments(): {
  surveyPath: string
  templatePath: string
  outputPath: string
} {
  const [surveyPath, templatePath, outputPath] = process.argv.slice(2)

  if (!surveyPath || !templatePath || !outputPath) {
    throw new Error(
      'Usage: npm run generate -- <survey.json> <template.html> <output.html>'
    )
  }

  return {
    surveyPath,
    templatePath,
    outputPath
  }
}

function main(): void {
  const { surveyPath, templatePath, outputPath } = readArguments()
  const survey = parseSurvey(JSON.parse(readFileSync(resolve(surveyPath), 'utf8')))
  const template = readFileSync(resolve(templatePath), 'utf8')
  const html = generateSurveyHtml(survey, template)
  const resolvedOutputPath = resolve(outputPath)

  mkdirSync(dirname(resolvedOutputPath), { recursive: true })
  writeFileSync(resolvedOutputPath, html)
  process.stdout.write(`${resolvedOutputPath}\n`)
}

main()
