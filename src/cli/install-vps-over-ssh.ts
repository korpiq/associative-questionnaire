import { execFileSync } from 'node:child_process'
import { join } from 'node:path'

import { buildSshInstallPlan } from '../deploy/build-ssh-install-plan'
import { loadDeploymentTarget } from '../deploy/load-deployment-target'
import { readTargetNameArgument } from './read-target-name-argument'

function main(): void {
  const workspaceRoot = process.cwd()
  const targetName = readTargetNameArgument(process.argv, '')

  if (!targetName) {
    throw new Error('Usage: npm run install:ssh -- <target-name>')
  }

  execFileSync('npm', ['run', 'build'], { stdio: 'inherit' })
  execFileSync('npm', ['run', 'prepare:container', '--', targetName], { stdio: 'inherit' })

  const target = loadDeploymentTarget({
    workspaceDirectory: workspaceRoot,
    targetName
  })
  const plan = buildSshInstallPlan({
    target,
    localProtectionSecretFilePath: join(workspaceRoot, '.deploy', 'reporter-protection-secret.txt')
  })

  plan.commands.forEach((command) => {
    const [file, ...args] = command
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
        remoteProtectionFilePath: plan.remoteProtectionFilePath
      },
      null,
      2
    )
  )
}

main()
