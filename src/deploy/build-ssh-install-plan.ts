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
  commands: Array<[string, ...string[]]>
} {
  if (input.target.type !== 'ssh') {
    throw new Error('SSH install plans require an ssh target configuration')
  }

  const remotePublicRoot = toRemoteShellPath(input.target.publicDir)
  const remoteCgiRoot = toRemoteShellPath(input.target.cgiDir)
  const remoteDataRoot = toRemoteShellPath(input.target.dataDir)

  return {
    remotePublicRoot,
    remoteCgiRoot,
    remoteDataRoot,
    commands: [
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
