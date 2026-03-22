import { resolve } from 'node:path'

import { installContainerTarball, loadDeploymentTarget } from '../index'
import { readTargetNameArgument } from './read-target-name-argument'

function readOptionalArgument(argv: string[], name: string): string | undefined {
  const index = argv.indexOf(name)

  if (index === -1) {
    return undefined
  }

  return argv[index + 1]
}

function main(): void {
  const workspaceRoot = process.cwd()
  const targetName = readTargetNameArgument(process.argv, 'sample')
  const deploymentTarget = loadDeploymentTarget({
    workspaceDirectory: workspaceRoot,
    targetName
  })

  if (deploymentTarget.type !== 'container') {
    throw new Error('Prepared container installs require a container target configuration')
  }

  installContainerTarball({
    containerName:
      readOptionalArgument(process.argv, '--container-name') ?? deploymentTarget.containerName,
    tarballPath:
      readOptionalArgument(process.argv, '--tarball-path') ??
      resolve(workspaceRoot, 'deploy', 'generated', 'container-image.tar.gz')
  })
}

main()
