import { pathToFileURL } from 'node:url'

import { buildDeploymentPackage } from '../deploy/build-deployment-package'
import { readSurveyDirectoryArgument } from './read-survey-directory-argument'

export function packageSurveyFromCli(argv: string[], workspaceDirectory: string): {
  targetName: string
  tarballPath: string
  deployScriptPath: string
  selectedSurveys: string[]
} {
  const { surveyDirectory, targetName } = readSurveyDirectoryArgument(argv, workspaceDirectory)
  const result = buildDeploymentPackage({
    workspaceDirectory,
    targetName,
    selectedSurveyDirectories: [surveyDirectory]
  })

  return {
    targetName,
    tarballPath: result.tarballPath,
    deployScriptPath: result.deployScriptPath,
    selectedSurveys: result.selectedSurveys
  }
}

function main(): void {
  console.log(JSON.stringify(packageSurveyFromCli(process.argv, process.cwd()), null, 2))
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
