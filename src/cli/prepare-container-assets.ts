import { chmodSync, copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { buildSync } from 'esbuild'

import {
  generateSurveyHtml,
  loadDeploymentTarget,
  parseSurvey,
  prepareReporterProtectionSecret
} from '../index'
import { listTargetDeployedSurveys } from '../deploy/list-target-deployed-surveys'

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
  const runtimeBundlePath = join(runtimeRoot, 'runtime-cgi.js')
  const deploymentTarget = loadDeploymentTarget({
    workspaceDirectory: workspaceRoot,
    targetName: 'sample'
  })
  const deployedSurveys = listTargetDeployedSurveys(deploymentTarget)

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
