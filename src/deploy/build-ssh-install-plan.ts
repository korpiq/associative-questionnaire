import type { LoadedDeploymentTarget } from './load-deployment-target'

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

export function buildSshInstallPlan(input: {
  target: LoadedDeploymentTarget
}): {
  remotePublicRoot: string
  remoteCgiRoot: string
  remoteDataRoot: string
  remoteStagingRoot: string
  localTarballPath: string
  commands: Array<[string, ...string[]]>
} {
  if (input.target.type !== 'ssh') {
    throw new Error('SSH install plans require an ssh target configuration')
  }

  const remotePublicRoot = toRemoteShellPath(input.target.publicDir)
  const remoteCgiRoot = toRemoteShellPath(input.target.cgiDir)
  const remoteDataRoot = toRemoteShellPath(input.target.dataDir)
  const remoteStagingRoot = `$HOME/.cache/associative-survey-deploy/${input.target.targetName}`
  const remoteScpTarballPath = `~/.cache/associative-survey-deploy/${input.target.targetName}/${input.target.targetName}.tar.gz`
  const remoteShellTarballPath = `${remoteStagingRoot}/${input.target.targetName}.tar.gz`
  const localTarballPath = `deploy/generated/${input.target.targetName}.tar.gz`

  return {
    remotePublicRoot,
    remoteCgiRoot,
    remoteDataRoot,
    remoteStagingRoot,
    localTarballPath,
    commands: [
      [
        'ssh',
        input.target.sshTarget,
        `mkdir -p ${quoteRemotePath(remoteStagingRoot)}`
      ],
      [
        'scp',
        localTarballPath,
        `${input.target.sshTarget}:${remoteScpTarballPath}`
      ],
      [
        'ssh',
        input.target.sshTarget,
        `tar -xzf ${quoteRemotePath(remoteShellTarballPath)} -C ${quoteRemotePath(remoteStagingRoot)} && ${quoteRemotePath(`${remoteStagingRoot}/setup.sh`)} ${quoteRemotePath(remoteShellTarballPath)}`
      ]
    ]
  }
}
