import { pathToFileURL } from 'node:url'

import { loadDeploymentTarget } from '../deploy/load-deployment-target'
import { prepareGeneratedContainerLayout } from '../deploy/prepare-generated-container-layout'
import { prepareGeneratedSshDeploymentPackage } from '../deploy/prepare-generated-ssh-deployment-package'
import { filterLoadedDeploymentTargetSurveys } from '../deploy/filter-loaded-deployment-target-surveys'
import { readSurveyDirectoryArgument } from './read-survey-directory-argument'

export function packageSurveyFromCli(argv: string[], workspaceDirectory: string): {
  targetName: string
  targetType: 'container' | 'ssh'
  tarballPath: string
  selectedSurveys: string[]
} {
  const { surveyDirectory, surveyName, targetName } = readSurveyDirectoryArgument(argv, workspaceDirectory)
  const target = filterLoadedDeploymentTargetSurveys(
    loadDeploymentTarget({
      workspaceDirectory,
      targetName
    }),
    [surveyDirectory]
  )

  const packageResult =
    target.type === 'container'
      ? prepareGeneratedContainerLayout({
          workspaceDirectory,
          targetName,
          selectedSurveyDirectories: [surveyDirectory]
        })
      : prepareGeneratedSshDeploymentPackage({
          workspaceDirectory,
          targetName,
          selectedSurveyDirectories: [surveyDirectory]
        })

  return {
    targetName,
    targetType: target.type,
    tarballPath: packageResult.tarballPath,
    selectedSurveys: [surveyName]
  }
}

function main(): void {
  console.log(JSON.stringify(packageSurveyFromCli(process.argv, process.cwd()), null, 2))
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
