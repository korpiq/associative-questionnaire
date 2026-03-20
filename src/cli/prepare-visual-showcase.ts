import { chmodSync, copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { buildSync } from 'esbuild'

import {
  buildGeneratedTargetSettings,
  generateSurveyHtml,
  loadDeploymentTarget,
  parseSurvey,
  prepareReporterCgiAsset,
  prepareSaverCgiAsset
} from '../index'

function ensureDirectory(path: string): void {
  mkdirSync(path, { recursive: true })
}

function main(): void {
  const workspaceRoot = process.cwd()
  const generatedRoot = resolve(workspaceRoot, 'deploy/generated')
  const generatedTargetSettingsPath = join(generatedRoot, 'container-target-settings.json')
  const publicRoot = join(generatedRoot, 'public')
  const publicCgiRoot = join(publicRoot, 'cgi-bin')
  const publicSurveyRoot = join(publicRoot, 'surveys')
  const runtimeRoot = join(generatedRoot, 'runtime')
  const runtimeSurveyRoot = join(runtimeRoot, 'surveys')
  const runtimeAnswerRoot = join(runtimeRoot, 'answers')
  const runtimeBundlePath = join(runtimeRoot, 'runtime-cgi.js')
  const deploymentTarget = loadDeploymentTarget({
    workspaceDirectory: workspaceRoot,
    targetName: 'sample'
  })
  const generatedTargetSettings = buildGeneratedTargetSettings(deploymentTarget)
  const generatedSurvey = generatedTargetSettings.surveyHtml.find(
    (survey) => survey.surveyName === 'visual-showcase'
  )

  if (!generatedSurvey) {
    throw new Error('Expected visual-showcase in the sample target')
  }

  const surveyPath = generatedSurvey.surveyPath
  const templatePath = generatedSurvey.templatePath
  const surveyName = generatedSurvey.surveyName
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
    formAction: generatedSurvey.formAction
  })

  writeFileSync(join(publicSurveyRoot, generatedSurvey.publicHtmlFilename), surveyHtml)
  copyFileSync(surveyPath, join(runtimeSurveyRoot, `${surveyName}.json`))
  writeFileSync(generatedTargetSettingsPath, JSON.stringify(generatedTargetSettings, null, 2))

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

  writeFileSync(
    saveScriptTargetPath,
    prepareSaverCgiAsset({
      saverScriptTemplate: readFileSync(saveScriptTemplatePath, 'utf8'),
      saverCgiSettings: generatedTargetSettings.saverCgi
    })
  )
  chmodSync(saveScriptTargetPath, 0o755)

  const preparedReporter = prepareReporterCgiAsset({
    reporterScriptTemplate: readFileSync(reporterScriptTemplatePath, 'utf8'),
    reporterCgiSettings: generatedTargetSettings.reporterCgi
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
        generatedTargetSettingsPath,
        surveyName,
        saveScriptTargetPath,
        reportScriptTargetPath
      },
      null,
      2
    )
  )
}

main()
