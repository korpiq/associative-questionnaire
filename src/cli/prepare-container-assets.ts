import { chmodSync, copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { buildSync } from 'esbuild'

import {
  buildGeneratedTargetSettings,
  generateSurveyHtml,
  loadDeploymentTarget,
  parseSurvey,
  prepareReporterCgiAsset,
  prepareSaverCgiAsset,
} from '../index'
import { readTargetNameArgument } from './read-target-name-argument'

function ensureDirectory(path: string): void {
  mkdirSync(path, { recursive: true })
}

function main(): void {
  const workspaceRoot = process.cwd()
  const targetName = readTargetNameArgument(process.argv, 'sample')
  const generatedRoot = resolve(workspaceRoot, 'deploy/generated')
  const publicRoot = join(generatedRoot, 'public')
  const publicCgiRoot = join(publicRoot, 'cgi-bin')
  const publicSurveyRoot = join(publicRoot, 'surveys')
  const runtimeRoot = join(generatedRoot, 'runtime')
  const runtimeSurveyRoot = join(runtimeRoot, 'surveys')
  const runtimeBundlePath = join(runtimeRoot, 'runtime-cgi.js')
  const deploymentTarget = loadDeploymentTarget({
    workspaceDirectory: workspaceRoot,
    targetName
  })
  const generatedTargetSettings = buildGeneratedTargetSettings(deploymentTarget)

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

  generatedTargetSettings.surveyHtml.forEach((generatedSurvey) => {
    const survey = parseSurvey(JSON.parse(readFileSync(generatedSurvey.surveyPath, 'utf8')))
    const template = readFileSync(generatedSurvey.templatePath, 'utf8')
    const surveyHtml = generateSurveyHtml(survey, template, {
      surveyName: generatedSurvey.surveyName,
      formAction: generatedSurvey.formAction
    })

    writeFileSync(join(publicSurveyRoot, generatedSurvey.publicHtmlFilename), surveyHtml)
    copyFileSync(
      generatedSurvey.surveyPath,
      join(runtimeSurveyRoot, `${generatedSurvey.surveyName}.json`)
    )
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
    reporterCgiSettings: generatedTargetSettings.reporterCgi,
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
        deploymentTargetName: deploymentTarget.targetName,
        deployedSurveys: generatedTargetSettings.surveyHtml,
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
