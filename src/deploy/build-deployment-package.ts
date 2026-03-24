import { chmodSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { isAbsolute, join, relative, resolve } from 'node:path'
import { gzipSync } from 'node:zlib'

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

function padToTarBlock(buffer: Buffer): Buffer {
  const remainder = buffer.length % 512

  return remainder === 0 ? buffer : Buffer.concat([buffer, Buffer.alloc(512 - remainder)])
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
    writeText(`${value.toString(8).padStart(length - 1, '0')}\0`, offset, length)
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

function createDeploymentTarGz(input: {
  filesRootDirectory: string
  filesHomeDirectory: string
  tarballPath: string
}): void {
  const buffers: Buffer[] = []
  ensureDirectory(resolve(input.tarballPath, '..'))

  function appendEntry(absolutePath: string, tarEntryName: string): void {
    const stats = statSync(absolutePath)

    if (stats.isDirectory()) {
      const directoryName = tarEntryName.endsWith('/') ? tarEntryName : `${tarEntryName}/`

      buffers.push(writeTarHeader({ name: directoryName, mode: 0o755, size: 0, mtime: Math.floor(stats.mtimeMs / 1000), typeflag: '5' }))
      readdirSync(absolutePath)
        .sort((a, b) => a.localeCompare(b))
        .forEach((entry) => {
          const childEntryName = tarEntryName.endsWith('/') ? `${tarEntryName}${entry}` : `${tarEntryName}/${entry}`

          appendEntry(join(absolutePath, entry), childEntryName)
        })
      return
    }

    const fileContents = readFileSync(absolutePath)

    buffers.push(
      writeTarHeader({ name: tarEntryName, mode: stats.mode & 0o777, size: fileContents.length, mtime: Math.floor(stats.mtimeMs / 1000), typeflag: '0' }),
      padToTarBlock(fileContents)
    )
  }

  function appendTree(sourceDirectory: string, makeEntryName: (rel: string) => string): void {
    if (!existsSync(sourceDirectory)) {
      return
    }

    readdirSync(sourceDirectory)
      .sort((a, b) => a.localeCompare(b))
      .forEach((entry) => {
        appendEntry(join(sourceDirectory, entry), makeEntryName(entry))
      })
  }

  // files/root entries become absolute paths: /path/to/file
  appendTree(input.filesRootDirectory, (entry) => `/${entry}`)
  // files/home entries become relative paths: path/to/file
  appendTree(input.filesHomeDirectory, (entry) => entry)

  buffers.push(Buffer.alloc(1024, 0))
  writeFileSync(input.tarballPath, gzipSync(Buffer.concat(buffers)))
}

function renderDeployScript(target: ReturnType<typeof loadDeploymentTarget>): string {
  const tarCommand = 'tar xPzvf - < package.tar.gz'
  const lines = ['#!/usr/bin/env sh', 'set -eu', '', 'SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)', '']

  if (target.type === 'ssh') {
    lines.push(
      'if [ -n "${ASSOCIATIVE_SURVEY_SSH_CONFIG:-}" ]; then',
      `  cd "$SCRIPT_DIR" && ssh -F "$ASSOCIATIVE_SURVEY_SSH_CONFIG" ${target.sshTarget} ${tarCommand}`,
      'else',
      `  cd "$SCRIPT_DIR" && ssh ${target.sshTarget} ${tarCommand}`,
      'fi',
      ''
    )
  } else {
    lines.push(`cd "$SCRIPT_DIR" && docker exec -i ${target.containerName} ${tarCommand}`, '')
  }

  return lines.join('\n')
}

export function buildDeploymentPackage(input: {
  workspaceDirectory: string
  targetName: string
  selectedSurveyDirectories?: string[]
  generatedRoot?: string
}): {
  packageDirectory: string
  tarballPath: string
  deployScriptPath: string
  filesRootDirectory: string
  filesHomeDirectory: string
  selectedSurveys: string[]
} {
  const generatedRoot =
    input.generatedRoot ?? resolve(input.workspaceDirectory, 'deploy')
  const packageDirectory = join(generatedRoot, input.targetName)
  const filesDirectory = join(packageDirectory, 'files')
  const filesRootDirectory = join(filesDirectory, 'root')
  const filesHomeDirectory = join(filesDirectory, 'home')
  const tarballPath = join(packageDirectory, 'package.tar.gz')
  const deployScriptPath = join(packageDirectory, 'deploy.sh')

  const deploymentTarget = filterLoadedDeploymentTargetSurveys(
    loadDeploymentTarget({
      workspaceDirectory: input.workspaceDirectory,
      targetName: input.targetName
    }),
    input.selectedSurveyDirectories
  )
  const generatedTargetSettings = buildGeneratedTargetSettings(deploymentTarget)
  const saverScriptTemplate = readFileSync(
    resolve(input.workspaceDirectory, 'templates', 'save-survey.js'),
    'utf8'
  )
  const reporterScriptTemplate = readFileSync(
    resolve(input.workspaceDirectory, 'templates', 'report-survey.template.js'),
    'utf8'
  )

  rmSync(filesRootDirectory, { recursive: true, force: true })
  rmSync(filesHomeDirectory, { recursive: true, force: true })
  rmSync(tarballPath, { force: true })
  ensureDirectory(filesRootDirectory)
  ensureDirectory(filesHomeDirectory)

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

  ensureDirectory(packageDirectory)
  createDeploymentTarGz({ filesRootDirectory, filesHomeDirectory, tarballPath })
  writeFileSync(deployScriptPath, renderDeployScript(deploymentTarget))
  chmodSync(deployScriptPath, 0o755)

  return {
    packageDirectory,
    tarballPath,
    deployScriptPath,
    filesRootDirectory,
    filesHomeDirectory,
    selectedSurveys: generatedTargetSettings.surveys.map((s) => s.surveyName)
  }
}
