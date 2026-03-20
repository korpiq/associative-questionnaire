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

function buildSharedCgiSettings(dataDir: string): {
  surveysDataDir: string
  answersDataDir: string
} {
  return {
    surveysDataDir: dataDir.endsWith('/') ? `${dataDir}surveys` : `${dataDir}/surveys`,
    answersDataDir: dataDir.endsWith('/') ? `${dataDir}answers` : `${dataDir}/answers`
  }
}

function main(): void {
  const workspaceRoot = process.cwd()
  const targetName = readTargetNameArgument(process.argv, 'sample')
  const generatedRoot = resolve(workspaceRoot, 'deploy/generated')
  const generatedTargetSettingsPath = join(generatedRoot, 'container-target-settings.json')
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

  generatedTargetSettings.surveys.forEach((generatedSurvey) => {
    const survey = parseSurvey(JSON.parse(readFileSync(generatedSurvey.surveyPath, 'utf8')))
    const template = readFileSync(generatedSurvey.templatePath, 'utf8')
    const surveyHtml = generateSurveyHtml(survey, template, {
      surveyName: generatedSurvey.surveyName,
      formAction: generatedSurvey.saveUrl
    })

    writeFileSync(join(publicSurveyRoot, generatedSurvey.publicHtmlFilename), surveyHtml)
    copyFileSync(
      generatedSurvey.surveyPath,
      join(runtimeSurveyRoot, `${generatedSurvey.surveyName}.json`)
    )
  })

  writeFileSync(generatedTargetSettingsPath, JSON.stringify(generatedTargetSettings, null, 2))
  const sharedCgiSettings = buildSharedCgiSettings(deploymentTarget.dataDir)

  const saveScriptTemplatePath = resolve(workspaceRoot, 'deploy/templates/save-survey.js')
  const reporterScriptTemplatePath = resolve(workspaceRoot, 'deploy/templates/report-survey.template.js')
  const saveScriptTargetPath = join(publicCgiRoot, 'save-survey.js')
  const reportScriptTargetPath = join(publicCgiRoot, 'report-survey.js')

  writeFileSync(
    saveScriptTargetPath,
    prepareSaverCgiAsset({
      saverScriptTemplate: readFileSync(saveScriptTemplatePath, 'utf8'),
      saverCgiSettings: sharedCgiSettings
    })
  )
  chmodSync(saveScriptTargetPath, 0o755)

  const preparedReporter = prepareReporterCgiAsset({
    reporterScriptTemplate: readFileSync(reporterScriptTemplatePath, 'utf8'),
    reporterCgiSettings: sharedCgiSettings
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
        generatedTargetSettingsPath,
        deploymentTargetName: deploymentTarget.targetName,
        deployedSurveys: generatedTargetSettings.surveys,
        saveScriptTargetPath,
        reportScriptTargetPath
      },
      null,
      2
    )
  )
}

main()
