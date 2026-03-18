import { chmodSync, copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { buildSync } from 'esbuild'

import {
  generateSurveyHtml,
  parseSurvey,
  prepareReporterProtectionSecret
} from '../index'

function ensureDirectory(path: string): void {
  mkdirSync(path, { recursive: true })
}

type DeployedSurvey = {
  publicHtmlFilename: string
  surveyName: string
  surveyPath: string
  templatePath: string
}

function main(): void {
  const workspaceRoot = process.cwd()
  const generatedRoot = resolve(workspaceRoot, 'deploy/generated')
  const publicRoot = join(generatedRoot, 'public')
  const publicCgiRoot = join(publicRoot, 'cgi-bin')
  const publicSurveyRoot = join(publicRoot, 'surveys')
  const runtimeRoot = join(generatedRoot, 'runtime')
  const runtimeSurveyRoot = join(runtimeRoot, 'surveys')
  const runtimeBundlePath = join(runtimeRoot, 'runtime-cgi.js')
  const deployedSurveys: DeployedSurvey[] = [
    {
      publicHtmlFilename: 'survey.html',
      surveyName: 'survey',
      surveyPath: resolve(workspaceRoot, 'docs/examples/basic/survey.json'),
      templatePath: resolve(workspaceRoot, 'docs/examples/basic/template.html')
    },
    {
      publicHtmlFilename: 'override-survey.html',
      surveyName: 'override-survey',
      surveyPath: resolve(workspaceRoot, 'docs/examples/snippet-overrides/survey.json'),
      templatePath: resolve(workspaceRoot, 'docs/examples/basic/template.html')
    }
  ]

  ensureDirectory(publicCgiRoot)
  ensureDirectory(publicSurveyRoot)
  ensureDirectory(runtimeSurveyRoot)

  buildSync({
    entryPoints: [resolve(workspaceRoot, 'src/runtime-cgi.ts')],
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node20',
    outfile: runtimeBundlePath
  })

  deployedSurveys.forEach((deployedSurvey) => {
    const survey = parseSurvey(JSON.parse(readFileSync(deployedSurvey.surveyPath, 'utf8')))
    const template = readFileSync(deployedSurvey.templatePath, 'utf8')
    const surveyHtml = generateSurveyHtml(survey, template, {
      surveyName: deployedSurvey.surveyName,
      formAction: '/cgi-bin/save-survey.js'
    })

    writeFileSync(join(publicSurveyRoot, deployedSurvey.publicHtmlFilename), surveyHtml)
    copyFileSync(
      deployedSurvey.surveyPath,
      join(runtimeSurveyRoot, `${deployedSurvey.surveyName}.json`)
    )
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
        runtimeBundlePath,
        deployedSurveys,
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
