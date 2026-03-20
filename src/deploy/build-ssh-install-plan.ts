import type { LoadedDeploymentTarget } from './load-deployment-target'
import { parseDeploymentPath } from './parse-deployment-path'

function quoteRemotePath(path: string): string {
  const escaped = path.replaceAll('\\', '\\\\').replaceAll('"', '\\"').replaceAll('`', '\\`')

  return `"${escaped}"`
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

function toResolvedRemoteShellPath(path: string): string {
  return toRemoteShellPath(path).replace('/./', '/')
}

function toParsedRemotePath(path: string): {
  existingRoot: string
  createableSubpath: string
  fullPath: string
} {
  return parseDeploymentPath(toRemoteShellPath(path))
}

function buildPathSetupCommand(input: {
  publicPath: string
  cgiPath: string
  dataDir: string
  createMissingSubpaths: boolean
}): string {
  const parsedPaths = [input.publicPath, input.cgiPath, input.dataDir].map(toParsedRemotePath)
  const checks: string[] = []
  const createablePaths: string[] = []

  parsedPaths.forEach((path) => {
    if (!path.createableSubpath || !input.createMissingSubpaths) {
      checks.push(`test -d ${quoteRemotePath(path.fullPath)}`)
      return
    }

    checks.push(`test -d ${quoteRemotePath(path.existingRoot)}`)
    createablePaths.push(path.fullPath)
  })

  const dataRoot = parsedPaths[2]?.fullPath

  if (!dataRoot) {
    throw new Error('Expected a data directory for the SSH install plan')
  }

  return [
    checks.join(' && '),
    [
      'mkdir -p',
      ...createablePaths.map(quoteRemotePath),
      quoteRemotePath(`${dataRoot}/surveys`),
      quoteRemotePath(`${dataRoot}/answers`)
    ].join(' ')
  ].join(' && ')
}

export function buildSshInstallPlan(input: {
  target: LoadedDeploymentTarget
}): {
  remotePublicRoot: string
  remoteCgiRoot: string
  remoteDataRoot: string
  commands: Array<[string, ...string[]]>
} {
  if (input.target.type !== 'ssh') {
    throw new Error('SSH install plans require an ssh target configuration')
  }

  const remotePublicRoot = toParsedRemotePath(input.target.publicPath).fullPath
  const remoteCgiRoot = toParsedRemotePath(input.target.cgiPath).fullPath
  const remoteDataRoot = toParsedRemotePath(input.target.dataDir).fullPath

  return {
    remotePublicRoot,
    remoteCgiRoot,
    remoteDataRoot,
    commands: [
      [
        'ssh',
        input.target.sshTarget,
        buildPathSetupCommand({
          publicPath: input.target.publicPath,
          cgiPath: input.target.cgiPath,
          dataDir: input.target.dataDir,
          createMissingSubpaths: input.target.createMissingSubpaths
        })
      ],
      [
        'scp',
        '-r',
        'deploy/generated/public/surveys/.',
        `${input.target.sshTarget}:${remotePublicRoot}/`
      ],
      [
        'scp',
        '-r',
        'deploy/generated/public/cgi-bin/.',
        `${input.target.sshTarget}:${remoteCgiRoot}/`
      ],
      [
        'scp',
        '-r',
        'deploy/generated/runtime/surveys/.',
        `${input.target.sshTarget}:${remoteDataRoot}/surveys/`
      ],
      [
        'ssh',
        input.target.sshTarget,
        `chmod 755 ${quoteRemotePath(remoteCgiRoot)}/*.js`
      ]
    ]
  }
}
