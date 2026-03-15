import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

import { generateQuestionnaireHtml } from '../generator/generate-questionnaire-html'
import { parseQuestionnaire } from '../schema/questionnaire'

function readArguments(): {
  questionnairePath: string
  templatePath: string
  outputPath: string
} {
  const [questionnairePath, templatePath, outputPath] = process.argv.slice(2)

  if (!questionnairePath || !templatePath || !outputPath) {
    throw new Error(
      'Usage: npm run generate -- <questionnaire.json> <template.html> <output.html>'
    )
  }

  return {
    questionnairePath,
    templatePath,
    outputPath
  }
}

function main(): void {
  const { questionnairePath, templatePath, outputPath } = readArguments()
  const questionnaire = parseQuestionnaire(
    JSON.parse(readFileSync(resolve(questionnairePath), 'utf8'))
  )
  const template = readFileSync(resolve(templatePath), 'utf8')
  const html = generateQuestionnaireHtml(questionnaire, template)
  const resolvedOutputPath = resolve(outputPath)

  mkdirSync(dirname(resolvedOutputPath), { recursive: true })
  writeFileSync(resolvedOutputPath, html)
  process.stdout.write(`${resolvedOutputPath}\n`)
}

main()
