import { execFileSync } from 'node:child_process'

import { buildSshInstallPlan } from '../deploy/build-ssh-install-plan'

function main(): void {
  const [sshTarget, installPath] = process.argv.slice(2)

  if (!sshTarget || !installPath) {
    throw new Error('Usage: npm run install:ssh -- <ssh-target> <install-path-under-remote-home>')
  }

  execFileSync('npm', ['run', 'build'], { stdio: 'inherit' })
  execFileSync('npm', ['run', 'prepare:container'], { stdio: 'inherit' })

  const plan = buildSshInstallPlan({ sshTarget, installPath })

  plan.commands.forEach((command) => {
    const [file, ...args] = command
    execFileSync(file, args, { stdio: 'inherit' })
  })

  console.log(
    JSON.stringify(
      {
        sshTarget,
        remotePublicRoot: plan.remotePublicRoot,
        remoteRuntimeRoot: plan.remoteRuntimeRoot
      },
      null,
      2
    )
  )
}

main()
