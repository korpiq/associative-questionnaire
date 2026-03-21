import { chmodSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

import { buildGeneratedSurveyArtifacts } from './build-generated-survey-artifacts'
import { buildGeneratedTargetSettings } from './build-generated-target-settings'
import { createTarGzFromDirectory } from './create-tar-gz-from-directory'
import { loadDeploymentTarget } from './load-deployment-target'

function ensureDirectory(path: string): void {
  mkdirSync(path, { recursive: true })
}

function resolveContainerPath(containerRoot: string, absoluteTargetPath: string): string {
  return join(containerRoot, absoluteTargetPath.replace(/^\/+/, ''))
}

function writeArtifactFiles(
  containerRoot: string,
  baseTargetPath: string,
  files: Array<{ relativePath: string; contents: string }>,
  executableMode?: number
): void {
  files.forEach((file) => {
    const outputPath = join(resolveContainerPath(containerRoot, baseTargetPath), file.relativePath)
    ensureDirectory(resolve(outputPath, '..'))
    writeFileSync(outputPath, file.contents)
    if (executableMode !== undefined) {
      chmodSync(outputPath, executableMode)
    }
  })
}

export function prepareGeneratedContainerLayout(input: {
  workspaceDirectory: string
  targetName: string
  generatedRoot?: string
}): {
  generatedRoot: string
  containerRoot: string
  manifestPath: string
  tarballPath: string
  surveys: ReturnType<typeof buildGeneratedTargetSettings>['surveys']
} {
  const generatedRoot =
    input.generatedRoot ?? resolve(input.workspaceDirectory, 'deploy', 'generated')
  const containerRoot = join(generatedRoot, 'root')
  const manifestPath = join(generatedRoot, 'container-target-settings.json')
  const tarballPath = join(generatedRoot, 'container-image.tar.gz')
  const deploymentTarget = loadDeploymentTarget({
    workspaceDirectory: input.workspaceDirectory,
    targetName: input.targetName
  })
  const generatedTargetSettings = buildGeneratedTargetSettings(deploymentTarget)
  const saveScriptTemplatePath = resolve(input.workspaceDirectory, 'deploy', 'templates', 'save-survey.js')
  const reporterScriptTemplatePath = resolve(
    input.workspaceDirectory,
    'deploy',
    'templates',
    'report-survey.template.js'
  )
  const saverScriptTemplate = readFileSync(saveScriptTemplatePath, 'utf8')
  const reporterScriptTemplate = readFileSync(reporterScriptTemplatePath, 'utf8')

  rmSync(containerRoot, { recursive: true, force: true })
  rmSync(tarballPath, { force: true })

  generatedTargetSettings.surveys.forEach((surveySettings) => {
    const artifacts = buildGeneratedSurveyArtifacts({
      surveyJson: readFileSync(surveySettings.surveyPath, 'utf8'),
      surveyTemplate: readFileSync(surveySettings.templatePath, 'utf8'),
      saverScriptTemplate,
      reporterScriptTemplate,
      surveySettings,
      nodeExecutable: deploymentTarget.nodeExecutable
    })

    writeArtifactFiles(containerRoot, surveySettings.publicDir, artifacts.publicFiles)
    writeArtifactFiles(containerRoot, surveySettings.cgiDir, artifacts.cgiFiles, 0o755)
    writeArtifactFiles(containerRoot, surveySettings.privateDataDir, artifacts.privateFiles)
  })

  writeFileSync(manifestPath, JSON.stringify(generatedTargetSettings, null, 2))
  createTarGzFromDirectory({
    sourceDirectory: containerRoot,
    tarballPath
  })

  return {
    generatedRoot,
    containerRoot,
    manifestPath,
    tarballPath,
    surveys: generatedTargetSettings.surveys
  }
}
