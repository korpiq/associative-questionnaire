import { chmodSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { gzipSync } from 'node:zlib'

import { buildGeneratedSurveyArtifacts } from './build-generated-survey-artifacts'
import { buildGeneratedTargetSettings } from './build-generated-target-settings'
import { loadDeploymentTarget } from './load-deployment-target'

function ensureDirectory(path: string): void {
  mkdirSync(path, { recursive: true })
}

function toRemoteShellPath(path: string): string {
  if (path === '~') {
    return '$HOME'
  }

  if (path.startsWith('~/')) {
    return `$HOME/${path.slice(2)}`
  }

  return path
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

function padToTarBlock(buffer: Buffer): Buffer {
  const remainder = buffer.length % 512

  if (remainder === 0) {
    return buffer
  }

  return Buffer.concat([buffer, Buffer.alloc(512 - remainder)])
}

function writeTarHeader(input: {
  name: string
  mode: number
  size: number
  mtime: number
  typeflag: '0' | '5'
}): Buffer {
  const header = Buffer.alloc(512, 0)
  const writeText = (value: string, offset: number, length: number) => {
    header.write(value.slice(0, length), offset, length, 'utf8')
  }
  const writeOctal = (value: number, offset: number, length: number) => {
    const encoded = value.toString(8).padStart(length - 1, '0')

    writeText(`${encoded}\0`, offset, length)
  }

  writeText(input.name, 0, 100)
  writeOctal(input.mode, 100, 8)
  writeOctal(0, 108, 8)
  writeOctal(0, 116, 8)
  writeOctal(input.size, 124, 12)
  writeOctal(input.mtime, 136, 12)
  writeText('        ', 148, 8)
  writeText(input.typeflag, 156, 1)
  writeText('ustar', 257, 6)
  writeText('00', 263, 2)

  let checksum = 0
  for (const byte of header.values()) {
    checksum += byte
  }

  writeText(`${checksum.toString(8).padStart(6, '0')}\0 `, 148, 8)

  return header
}

function createTarGzFromDirectory(input: {
  sourceDirectory: string
  tarballPath: string
}): void {
  const buffers: Buffer[] = []

  function appendEntry(absolutePath: string, relativePath: string): void {
    const stats = statSync(absolutePath)
    const tarPath = relativePath.startsWith('./') ? relativePath : `./${relativePath}`

    if (stats.isDirectory()) {
      const directoryPath = tarPath.endsWith('/') ? tarPath : `${tarPath}/`

      buffers.push(
        writeTarHeader({
          name: directoryPath,
          mode: 0o755,
          size: 0,
          mtime: Math.floor(stats.mtimeMs / 1000),
          typeflag: '5'
        })
      )

      readdirSync(absolutePath)
        .sort((left, right) => left.localeCompare(right))
        .forEach((entry) => {
          appendEntry(join(absolutePath, entry), `${relativePath}/${entry}`)
        })
      return
    }

    const fileContents = readFileSync(absolutePath)

    buffers.push(
      writeTarHeader({
        name: tarPath,
        mode: stats.mode & 0o777,
        size: fileContents.length,
        mtime: Math.floor(stats.mtimeMs / 1000),
        typeflag: '0'
      }),
      padToTarBlock(fileContents)
    )
  }

  readdirSync(input.sourceDirectory)
    .sort((left, right) => left.localeCompare(right))
    .forEach((entry) => {
      appendEntry(join(input.sourceDirectory, entry), entry)
    })

  buffers.push(Buffer.alloc(1024, 0))
  writeFileSync(input.tarballPath, gzipSync(Buffer.concat(buffers)))
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
    `PUBLIC_DIR="${toRemoteShellPath(input.publicDir)}"`,
    `CGI_DIR="${toRemoteShellPath(input.cgiDir)}"`,
    `DATA_DIR="${toRemoteShellPath(input.dataDir)}"`,
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
  const deploymentTarget = loadDeploymentTarget({
    workspaceDirectory: input.workspaceDirectory,
    targetName: input.targetName
  })

  if (deploymentTarget.type !== 'ssh') {
    throw new Error('SSH deployment packages require an ssh target configuration')
  }

  const generatedTargetSettings = buildGeneratedTargetSettings(deploymentTarget)
  const saverScriptTemplate = readFileSync(
    resolve(input.workspaceDirectory, 'deploy', 'templates', 'save-survey.js'),
    'utf8'
  )
  const reporterScriptTemplate = readFileSync(
    resolve(input.workspaceDirectory, 'deploy', 'templates', 'report-survey.template.js'),
    'utf8'
  )

  rmSync(packageRoot, { recursive: true, force: true })
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
