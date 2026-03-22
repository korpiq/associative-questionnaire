import { chmodSync, copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
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
import { createTarGzFromDirectory } from '../deploy/create-tar-gz-from-directory'

function ensureDirectory(path: string): void {
  mkdirSync(path, { recursive: true })
}

function resolveContainerPath(containerRoot: string, absoluteTargetPath: string): string {
  return join(containerRoot, absoluteTargetPath.replace(/^\/+/, ''))
}

function main(): void {
  const workspaceRoot = process.cwd()
  const generatedRoot = resolve(workspaceRoot, 'deploy/generated')
  const generatedTargetSettingsPath = join(generatedRoot, 'container-target-settings.json')
  const containerRoot = join(generatedRoot, 'root')
  const tarballPath = join(generatedRoot, 'container-image.tar.gz')
  const publicRoot = join(generatedRoot, 'public')
  const runtimeRoot = join(generatedRoot, 'runtime')
  const runtimeSurveyRoot = join(runtimeRoot, 'surveys')
  const runtimeAnswerRoot = join(runtimeRoot, 'answers')
  const runtimeBundlePath = join(runtimeRoot, 'runtime-cgi.js')
  const deploymentTarget = loadDeploymentTarget({
    workspaceDirectory: workspaceRoot,
    targetName: 'sample'
  })
  const generatedTargetSettings = buildGeneratedTargetSettings(deploymentTarget)
  const generatedSurvey = generatedTargetSettings.surveys.find(
    (survey) => survey.surveyName === 'visual-showcase'
  )

  if (!generatedSurvey) {
    throw new Error('Expected visual-showcase in the sample target')
  }

  const surveyPath = generatedSurvey.surveyPath
  const templatePath = generatedSurvey.templatePath
  const surveyName = generatedSurvey.surveyName
  const surveyAnswerRoot = join(runtimeAnswerRoot, surveyName)
  const publicCgiRoot = join(publicRoot, 'cgi-bin', surveyName)
  const publicSurveyRoot = join(publicRoot, 'surveys', surveyName)
  const containerPublicSurveyRoot = resolveContainerPath(containerRoot, generatedSurvey.publicDir)
  const containerCgiRoot = resolveContainerPath(containerRoot, generatedSurvey.cgiDir)
  const containerPrivateSurveyPath = resolveContainerPath(
    containerRoot,
    generatedSurvey.privateSurveyPath
  )
  const containerPrivateAnswersRoot = resolveContainerPath(
    containerRoot,
    generatedSurvey.privateAnswersDir
  )

  ensureDirectory(publicCgiRoot)
  ensureDirectory(publicSurveyRoot)
  ensureDirectory(runtimeSurveyRoot)
  ensureDirectory(surveyAnswerRoot)
  rmSync(containerRoot, { recursive: true, force: true })
  rmSync(tarballPath, { force: true })
  ensureDirectory(containerPublicSurveyRoot)
  ensureDirectory(containerCgiRoot)
  ensureDirectory(dirname(containerPrivateSurveyPath))
  ensureDirectory(containerPrivateAnswersRoot)

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
    formAction: generatedSurvey.saveUrl
  })

  writeFileSync(join(publicSurveyRoot, generatedSurvey.publicHtmlFilename), surveyHtml)
  writeFileSync(join(containerPublicSurveyRoot, generatedSurvey.publicHtmlFilename), surveyHtml)
  copyFileSync(surveyPath, join(runtimeSurveyRoot, `${surveyName}.json`))
  copyFileSync(surveyPath, containerPrivateSurveyPath)
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
    writeFileSync(
      join(containerPrivateAnswersRoot, filename),
      JSON.stringify(answerFile, null, 2)
    )
  })
  const saveScriptTemplatePath = resolve(workspaceRoot, 'deploy/templates/save-survey.js')
  const reporterScriptTemplatePath = resolve(workspaceRoot, 'deploy/templates/report-survey.template.js')
  const saveScriptTargetPath = join(publicCgiRoot, generatedSurvey.saveCgiFilename)
  const reportScriptTargetPath = join(publicCgiRoot, generatedSurvey.reportCgiFilename)

  writeFileSync(
    saveScriptTargetPath,
    prepareSaverCgiAsset({
      saverScriptTemplate: readFileSync(saveScriptTemplatePath, 'utf8'),
      saverCgiSettings: generatedSurvey
    })
  )
  chmodSync(saveScriptTargetPath, 0o755)
  writeFileSync(
    join(containerCgiRoot, generatedSurvey.saveCgiFilename),
    readFileSync(saveScriptTargetPath, 'utf8')
  )
  chmodSync(join(containerCgiRoot, generatedSurvey.saveCgiFilename), 0o755)

  const preparedReporter = prepareReporterCgiAsset({
    reporterScriptTemplate: readFileSync(reporterScriptTemplatePath, 'utf8'),
    reporterCgiSettings: generatedSurvey
  })

  ensureDirectory(dirname(reportScriptTargetPath))
  writeFileSync(reportScriptTargetPath, preparedReporter.preparedReporterScript)
  chmodSync(reportScriptTargetPath, 0o755)
  const containerReportScriptPath = join(containerCgiRoot, generatedSurvey.reportCgiFilename)
  writeFileSync(containerReportScriptPath, preparedReporter.preparedReporterScript)
  chmodSync(containerReportScriptPath, 0o755)

  createTarGzFromDirectory({
    sourceDirectory: containerRoot,
    tarballPath
  })

  console.log(
    JSON.stringify(
      {
        publicRoot,
        runtimeSurveyRoot,
        runtimeAnswerRoot,
        runtimeBundlePath,
        generatedTargetSettingsPath,
        containerRoot,
        tarballPath,
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
