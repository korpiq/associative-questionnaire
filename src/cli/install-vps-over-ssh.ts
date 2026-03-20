import { execFileSync } from 'node:child_process'
import { buildSshInstallPlan } from '../deploy/build-ssh-install-plan'
import { loadDeploymentTarget } from '../deploy/load-deployment-target'
import { prepareGeneratedSshDeploymentPackage } from '../deploy/prepare-generated-ssh-deployment-package'
import { readTargetNameArgument } from './read-target-name-argument'

function applyConfiguredSshOptions(command: [string, ...string[]]): [string, ...string[]] {
  const sshConfigPath = process.env.ASSOCIATIVE_SURVEY_SSH_CONFIG

  if (!sshConfigPath) {
    return command
  }

  const [file, ...args] = command
  if (file !== 'ssh' && file !== 'scp') {
    return command
  }

  return [file, '-F', sshConfigPath, ...args]
}

function main(): void {
  const workspaceRoot = process.cwd()
  const targetName = readTargetNameArgument(process.argv, '')

  if (!targetName) {
    throw new Error('Usage: npm run install:ssh -- <target-name>')
  }

  execFileSync('npm', ['run', 'build'], { stdio: 'inherit' })
  prepareGeneratedSshDeploymentPackage({
    workspaceDirectory: workspaceRoot,
    targetName
  })

  const target = loadDeploymentTarget({
    workspaceDirectory: workspaceRoot,
    targetName
  })
  const plan = buildSshInstallPlan({
    target
  })

  plan.commands.forEach((command) => {
    const [file, ...args] = applyConfiguredSshOptions(command)
    execFileSync(file, args, { stdio: 'inherit' })
  })

  console.log(
    JSON.stringify(
      {
        targetName,
        sshTarget: target.type === 'ssh' ? target.sshTarget : undefined,
        remotePublicRoot: plan.remotePublicRoot,
        remoteCgiRoot: plan.remoteCgiRoot,
        remoteDataRoot: plan.remoteDataRoot,
        remoteStagingRoot: plan.remoteStagingRoot,
        localTarballPath: plan.localTarballPath
      },
      null,
      2
    )
  )
}

main()
