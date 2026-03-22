import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

function quoteShellArgument(value: string): string {
  return `'${value.replace(/'/g, `'\"'\"'`)}'`
}

function runDockerCommand(args: string[], input?: Buffer): void {
  const result = spawnSync('docker', args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    input
  })
  const output = `${result.stdout}${result.stderr}`.trim()

  if (result.status !== 0) {
    throw new Error(`Command failed: docker ${args.join(' ')}\n${output}`.trim())
  }
}

export function installContainerTarball(input: {
  containerName: string
  tarballPath: string
  containerTarballPath?: string
  extractRoot?: string
}): void {
  const containerTarballPath = input.containerTarballPath ?? '/tmp/deployable-container.tar.gz'
  const extractRoot = input.extractRoot ?? '/'
  const tarballBuffer = readFileSync(input.tarballPath)
  const quotedContainerTarballPath = quoteShellArgument(containerTarballPath)
  const quotedExtractRoot = quoteShellArgument(extractRoot)

  runDockerCommand([
    'exec',
    input.containerName,
    'sh',
    '-lc',
    `rm -f ${quotedContainerTarballPath}`
  ])
  runDockerCommand(
    ['exec', '-i', input.containerName, 'sh', '-lc', `cat > ${quotedContainerTarballPath}`],
    tarballBuffer
  )
  runDockerCommand([
    'exec',
    input.containerName,
    'sh',
    '-lc',
    `tar -xzf ${quotedContainerTarballPath} -C ${quotedExtractRoot} && rm -f ${quotedContainerTarballPath}`
  ])
}
