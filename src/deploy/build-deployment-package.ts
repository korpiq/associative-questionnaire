import { chmodSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { isAbsolute, join, resolve } from 'node:path'

import { buildGeneratedSurveyArtifacts } from './build-generated-survey-artifacts'
import { buildGeneratedTargetSettings } from './build-generated-target-settings'
import { filterLoadedDeploymentTargetSurveys } from './filter-loaded-deployment-target-surveys'
import { loadDeploymentTarget } from './load-deployment-target'

function ensureDirectory(path: string): void {
  mkdirSync(path, { recursive: true })
}

function writeArtifactFiles(
  localRoot: string,
  targetPath: string,
  files: Array<{ relativePath: string; contents: string }>,
  executableMode?: number
): void {
  const strippedPath = targetPath.replace(/^\/+/, '')

  files.forEach((file) => {
    const outputPath = join(localRoot, strippedPath, file.relativePath)

    ensureDirectory(resolve(outputPath, '..'))
    writeFileSync(outputPath, file.contents)
    if (executableMode !== undefined) {
      chmodSync(outputPath, executableMode)
    }
  })
}

export function buildDeploymentPackage(input: {
  workspaceDirectory: string
  targetName: string
  selectedSurveyDirectories?: string[]
  generatedRoot?: string
}): {
  packageDirectory: string
  filesRootDirectory: string
  filesHomeDirectory: string
} {
  const generatedRoot =
    input.generatedRoot ?? resolve(input.workspaceDirectory, 'deploy')
  const packageDirectory = join(generatedRoot, input.targetName)
  const filesDirectory = join(packageDirectory, 'files')
  const filesRootDirectory = join(filesDirectory, 'root')
  const filesHomeDirectory = join(filesDirectory, 'home')

  const deploymentTarget = filterLoadedDeploymentTargetSurveys(
    loadDeploymentTarget({
      workspaceDirectory: input.workspaceDirectory,
      targetName: input.targetName
    }),
    input.selectedSurveyDirectories
  )
  const generatedTargetSettings = buildGeneratedTargetSettings(deploymentTarget)
  const saverScriptTemplate = readFileSync(
    resolve(input.workspaceDirectory, 'deploy', 'templates', 'save-survey.js'),
    'utf8'
  )
  const reporterScriptTemplate = readFileSync(
    resolve(input.workspaceDirectory, 'deploy', 'templates', 'report-survey.template.js'),
    'utf8'
  )

  rmSync(filesRootDirectory, { recursive: true, force: true })
  rmSync(filesHomeDirectory, { recursive: true, force: true })

  generatedTargetSettings.surveys.forEach((surveySettings) => {
    const artifacts = buildGeneratedSurveyArtifacts({
      surveyJson: readFileSync(surveySettings.surveyPath, 'utf8'),
      surveyTemplate: readFileSync(surveySettings.templatePath, 'utf8'),
      saverScriptTemplate,
      reporterScriptTemplate,
      surveySettings,
      nodeExecutable: deploymentTarget.nodeExecutable
    })

    const publicRoot = isAbsolute(surveySettings.publicDir) ? filesRootDirectory : filesHomeDirectory
    const cgiRoot = isAbsolute(surveySettings.cgiDir) ? filesRootDirectory : filesHomeDirectory
    const dataRoot = isAbsolute(surveySettings.privateDataDir) ? filesRootDirectory : filesHomeDirectory

    writeArtifactFiles(publicRoot, surveySettings.publicDir, artifacts.publicFiles)
    writeArtifactFiles(cgiRoot, surveySettings.cgiDir, artifacts.cgiFiles, 0o755)
    writeArtifactFiles(dataRoot, surveySettings.privateDataDir, artifacts.privateFiles)
  })

  return {
    packageDirectory,
    filesRootDirectory,
    filesHomeDirectory
  }
}
