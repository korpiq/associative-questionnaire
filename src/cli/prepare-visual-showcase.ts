import { chmodSync, copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { buildSync } from 'esbuild'

import { generateSurveyHtml, parseSurvey, prepareReporterProtectionSecret } from '../index'

function ensureDirectory(path: string): void {
  mkdirSync(path, { recursive: true })
}

function main(): void {
  const workspaceRoot = process.cwd()
  const generatedRoot = resolve(workspaceRoot, 'deploy/generated')
  const publicRoot = join(generatedRoot, 'public')
  const publicCgiRoot = join(publicRoot, 'cgi-bin')
  const publicSurveyRoot = join(publicRoot, 'surveys')
  const runtimeRoot = join(generatedRoot, 'runtime')
  const runtimeSurveyRoot = join(runtimeRoot, 'surveys')
  const runtimeAnswerRoot = join(runtimeRoot, 'answers')
  const runtimeBundlePath = join(runtimeRoot, 'runtime-cgi.js')
  const surveyPath = resolve(workspaceRoot, 'docs/examples/visual-correctness-showcase/survey.json')
  const templatePath = resolve(workspaceRoot, 'docs/examples/basic/template.html')
  const surveyName = 'visual-showcase'
  const surveyAnswerRoot = join(runtimeAnswerRoot, surveyName)

  ensureDirectory(publicCgiRoot)
  ensureDirectory(publicSurveyRoot)
  ensureDirectory(runtimeSurveyRoot)
  ensureDirectory(surveyAnswerRoot)

  buildSync({
    entryPoints: [resolve(workspaceRoot, 'src/runtime-cgi.ts')],
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node20',
    outfile: runtimeBundlePath
  })

  const survey = parseSurvey(JSON.parse(readFileSync(surveyPath, 'utf8')))
  const template = readFileSync(templatePath, 'utf8')
  const surveyHtml = generateSurveyHtml(survey, template, {
    surveyName,
    formAction: '/cgi-bin/save-survey.js'
  })

  writeFileSync(join(publicSurveyRoot, 'visual-showcase.html'), surveyHtml)
  copyFileSync(surveyPath, join(runtimeSurveyRoot, `${surveyName}.json`))

  const seededAnswers = [
    {
      filename: 'showcase-1.json',
      answerFile: {
        surveyTitle: 'Correctness showcase',
        answers: {
          'favorite-color': { type: 'single-choice', value: 'blue' },
          hobbies: { type: 'multi-choice', value: ['music', 'sports'] },
          notes: { type: 'free-text', value: 'Calm' },
          matches: {
            type: 'associative',
            value: [
              { left: '1', right: 'A' },
              { left: '2', right: 'B' }
            ]
          }
        }
      }
    },
    {
      filename: 'showcase-2.json',
      answerFile: {
        surveyTitle: 'Correctness showcase',
        answers: {
          'favorite-color': { type: 'single-choice', value: 'red' },
          hobbies: { type: 'multi-choice', value: ['music'] },
          notes: { type: 'free-text', value: 'Loud' },
          matches: {
            type: 'associative',
            value: [{ left: '1', right: 'B' }]
          }
        }
      }
    },
    {
      filename: 'showcase-3.json',
      answerFile: {
        surveyTitle: 'Correctness showcase',
        answers: {
          'favorite-color': { type: 'single-choice', value: 'blue' },
          hobbies: { type: 'multi-choice', value: ['sports'] },
          notes: { type: 'free-text', value: 'Precise' },
          matches: {
            type: 'associative',
            value: [
              { left: '1', right: 'A' },
              { left: '2', right: 'A' }
            ]
          }
        }
      }
    }
  ]

  seededAnswers.forEach(({ filename, answerFile }) => {
    writeFileSync(join(surveyAnswerRoot, filename), JSON.stringify(answerFile, null, 2))
  })

  const saveScriptTemplatePath = resolve(workspaceRoot, 'deploy/templates/save-survey.js')
  const reporterScriptTemplatePath = resolve(workspaceRoot, 'deploy/templates/report-survey.template.js')
  const saveScriptTargetPath = join(publicCgiRoot, 'save-survey.js')
  const reportScriptTargetPath = join(publicCgiRoot, 'report-survey.js')

  copyFileSync(saveScriptTemplatePath, saveScriptTargetPath)
  chmodSync(saveScriptTargetPath, 0o755)

  const preparedReporter = prepareReporterProtectionSecret({
    reporterScriptTemplate: readFileSync(reporterScriptTemplatePath, 'utf8'),
    deploymentWorkspaceDirectory: workspaceRoot
  })

  ensureDirectory(dirname(reportScriptTargetPath))
  writeFileSync(reportScriptTargetPath, preparedReporter.preparedReporterScript)
  chmodSync(reportScriptTargetPath, 0o755)

  console.log(
    JSON.stringify(
      {
        publicRoot,
        runtimeSurveyRoot,
        runtimeAnswerRoot,
        runtimeBundlePath,
        surveyName,
        saveScriptTargetPath,
        reportScriptTargetPath,
        storedSecretFilePath: preparedReporter.storedSecretFilePath
      },
      null,
      2
    )
  )
}

main()
