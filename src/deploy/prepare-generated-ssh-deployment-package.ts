import { chmodSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

import { buildGeneratedSurveyArtifacts } from './build-generated-survey-artifacts'
import { buildGeneratedTargetSettings } from './build-generated-target-settings'
import { createTarGzFromDirectory } from './create-tar-gz-from-directory'
import { filterLoadedDeploymentTargetSurveys } from './filter-loaded-deployment-target-surveys'
import { loadDeploymentTarget } from './load-deployment-target'

function ensureDirectory(path: string): void {
  mkdirSync(path, { recursive: true })
}

function writeArtifactFiles(
  outputRoot: string,
  files: Array<{ relativePath: string; contents: string }>,
  executableMode?: number
): void {
  files.forEach((file) => {
    const outputPath = join(outputRoot, file.relativePath)

    ensureDirectory(resolve(outputPath, '..'))
    writeFileSync(outputPath, file.contents)
    if (executableMode !== undefined) {
      chmodSync(outputPath, executableMode)
    }
  })
}

function renderSetupScript(input: {
  publicDir: string
  cgiDir: string
  dataDir: string
  cgiExtension: string
}): string {
  return [
    '#!/usr/bin/env sh',
    'set -eu',
    '',
    `PUBLIC_DIR="${input.publicDir}"`,
    `CGI_DIR="${input.cgiDir}"`,
    `DATA_DIR="${input.dataDir}"`,
    `CGI_EXTENSION="${input.cgiExtension}"`,
    '',
    'ARCHIVE_PATH="${1:-}"',
    'SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)',
    '',
    'mkdir -p "$PUBLIC_DIR" "$CGI_DIR" "$DATA_DIR"',
    'cp -R "$SCRIPT_DIR/payload/public/." "$PUBLIC_DIR/"',
    'cp -R "$SCRIPT_DIR/payload/cgi/." "$CGI_DIR/"',
    'cp -R "$SCRIPT_DIR/payload/data/." "$DATA_DIR/"',
    'find "$CGI_DIR" -type f -name "*$CGI_EXTENSION" -exec chmod 755 {} \\;',
    'if [ -n "$ARCHIVE_PATH" ]; then',
    '  rm -f "$ARCHIVE_PATH"',
    'fi',
    'rm -rf "$SCRIPT_DIR"',
    ''
  ].join('\n')
}

export function prepareGeneratedSshDeploymentPackage(input: {
  workspaceDirectory: string
  targetName: string
  generatedRoot?: string
  selectedSurveyDirectories?: string[]
}): {
  generatedRoot: string
  packageRoot: string
  setupScriptPath: string
  tarballPath: string
} {
  const generatedRoot =
    input.generatedRoot ?? resolve(input.workspaceDirectory, 'deploy', 'generated')
  const packageRoot = join(generatedRoot, 'ssh-package', input.targetName)
  const payloadPublicRoot = join(packageRoot, 'payload', 'public')
  const payloadCgiRoot = join(packageRoot, 'payload', 'cgi')
  const payloadDataRoot = join(packageRoot, 'payload', 'data')
  const setupScriptPath = join(packageRoot, 'setup.sh')
  const tarballPath = join(generatedRoot, `${input.targetName}.tar.gz`)
  const deploymentTarget = filterLoadedDeploymentTargetSurveys(
    loadDeploymentTarget({
      workspaceDirectory: input.workspaceDirectory,
      targetName: input.targetName
    }),
    input.selectedSurveyDirectories
  )

  if (deploymentTarget.type !== 'ssh') {
    throw new Error('SSH deployment packages require an ssh target configuration')
  }

  const generatedTargetSettings = buildGeneratedTargetSettings(deploymentTarget)
  const saverScriptTemplate = readFileSync(
    resolve(input.workspaceDirectory, 'templates', 'save-survey.js'),
    'utf8'
  )
  const reporterScriptTemplate = readFileSync(
    resolve(input.workspaceDirectory, 'templates', 'report-survey.template.js'),
    'utf8'
  )

  rmSync(packageRoot, { recursive: true, force: true })
  rmSync(tarballPath, { force: true })
  ensureDirectory(packageRoot)

  generatedTargetSettings.surveys.forEach((surveySettings) => {
    const artifacts = buildGeneratedSurveyArtifacts({
      surveyJson: readFileSync(surveySettings.surveyPath, 'utf8'),
      surveyTemplate: readFileSync(surveySettings.templatePath, 'utf8'),
      saverScriptTemplate,
      reporterScriptTemplate,
      surveySettings,
      nodeExecutable: deploymentTarget.nodeExecutable
    })

    writeArtifactFiles(join(payloadPublicRoot, surveySettings.surveyName), artifacts.publicFiles)
    writeArtifactFiles(join(payloadCgiRoot, surveySettings.surveyName), artifacts.cgiFiles, 0o755)
    writeArtifactFiles(join(payloadDataRoot, surveySettings.surveyName), artifacts.privateFiles)
  })

  ensureDirectory(packageRoot)
  writeFileSync(
    setupScriptPath,
    renderSetupScript({
      publicDir: deploymentTarget.publicDir,
      cgiDir: deploymentTarget.cgiDir,
      dataDir: deploymentTarget.dataDir,
      cgiExtension: deploymentTarget.cgiExtension
    })
  )
  chmodSync(setupScriptPath, 0o755)

  createTarGzFromDirectory({
    sourceDirectory: packageRoot,
    tarballPath
  })

  return {
    generatedRoot,
    packageRoot,
    setupScriptPath,
    tarballPath
  }
}
