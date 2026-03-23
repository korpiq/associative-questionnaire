import { pathToFileURL } from 'node:url'

import { loadDeploymentTarget } from '../deploy/load-deployment-target'
import { prepareGeneratedContainerLayout } from '../deploy/prepare-generated-container-layout'
import { prepareGeneratedSshDeploymentPackage } from '../deploy/prepare-generated-ssh-deployment-package'
import { readTargetDirectoryArgument } from './read-target-directory-argument'

export function packageTargetFromCli(argv: string[], workspaceDirectory: string): {
  targetName: string
  targetType: 'container' | 'ssh'
  tarballPath: string
  selectedSurveys: string[]
} {
  const { targetName } = readTargetDirectoryArgument(argv, workspaceDirectory)
  const target = loadDeploymentTarget({
    workspaceDirectory,
    targetName
  })

  const packageResult =
    target.type === 'container'
      ? prepareGeneratedContainerLayout({
          workspaceDirectory,
          targetName
        })
      : prepareGeneratedSshDeploymentPackage({
          workspaceDirectory,
          targetName
        })

  return {
    targetName,
    targetType: target.type,
    tarballPath: packageResult.tarballPath,
    selectedSurveys: target.surveys.map((survey) => survey.surveyName)
  }
}

function main(): void {
  console.log(JSON.stringify(packageTargetFromCli(process.argv, process.cwd()), null, 2))
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
