import { existsSync } from 'node:fs'
import { relative, resolve, sep } from 'node:path'

function readRequiredArgument(argv: string[], usage: string): string {
  const value = argv[2]

  if (!value) {
    throw new Error(usage)
  }

  return value
}

function ensurePathIsInside(parentDirectory: string, path: string, message: string): string {
  const relativePath = relative(parentDirectory, path)

  if (
    !relativePath ||
    relativePath.startsWith('..') ||
    relativePath.includes(`${sep}..${sep}`) ||
    relativePath === '..'
  ) {
    throw new Error(message)
  }

  return relativePath
}

export function readTargetDirectoryArgument(argv: string[], workspaceDirectory: string): {
  targetDirectory: string
  targetName: string
} {
  const inputPath = readRequiredArgument(argv, 'Usage: npm run package:target -- <target-folder>')
  const targetDirectory = resolve(workspaceDirectory, inputPath)
  const targetsRoot = resolve(workspaceDirectory, 'targets')
  const relativeTargetPath = ensurePathIsInside(
    targetsRoot,
    targetDirectory,
    'Target folder must be inside targets/'
  )

  if (relativeTargetPath.includes(sep)) {
    throw new Error('Target folder must point directly to targets/<target-name>')
  }

  if (!existsSync(resolve(targetDirectory, 'target.json'))) {
    throw new Error(`Target folder must contain target.json: ${inputPath}`)
  }

  return {
    targetDirectory,
    targetName: relativeTargetPath
  }
}
