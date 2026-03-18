function quoteRemotePath(path: string): string {
  return `'${path.replaceAll("'", "'\"'\"'")}'`
}

function validateInstallPath(installPath: string): string {
  if (!installPath) {
    throw new Error('Install path must not be empty')
  }

  if (installPath.startsWith('/')) {
    throw new Error('Install path must be relative to the remote home directory')
  }

  if (installPath.split('/').some((segment) => segment === '' || segment === '.' || segment === '..')) {
    throw new Error('Install path must not contain empty, "." or ".." segments')
  }

  return installPath
}

export function buildSshInstallPlan(input: {
  sshTarget: string
  installPath: string
}): {
  remotePublicRoot: string
  remoteRuntimeRoot: string
  commands: Array<[string, ...string[]]>
} {
  const installPath = validateInstallPath(input.installPath)
  const remotePublicRoot = `$HOME/${installPath}/public`
  const remoteRuntimeRoot = '$HOME/.local/share/associative-survey'

  return {
    remotePublicRoot,
    remoteRuntimeRoot,
    commands: [
      [
        'ssh',
        input.sshTarget,
        [
          'mkdir -p',
          quoteRemotePath(`${remotePublicRoot}/cgi-bin`),
          quoteRemotePath(`${remotePublicRoot}/surveys`),
          quoteRemotePath(`${remoteRuntimeRoot}/surveys`),
          quoteRemotePath(`${remoteRuntimeRoot}/answers`)
        ].join(' ')
      ],
      [
        'scp',
        '-r',
        'deploy/generated/public/.',
        `${input.sshTarget}:${remotePublicRoot}/`
      ],
      [
        'scp',
        '-r',
        'deploy/generated/runtime/surveys/.',
        `${input.sshTarget}:${remoteRuntimeRoot}/surveys/`
      ],
      [
        'ssh',
        input.sshTarget,
        `chmod 755 ${quoteRemotePath(`${remotePublicRoot}/cgi-bin`)}/*.js`
      ]
    ]
  }
}
