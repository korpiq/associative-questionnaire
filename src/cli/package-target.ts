import { pathToFileURL } from 'node:url'

import { buildDeploymentPackage } from '../deploy/build-deployment-package'
import { readTargetDirectoryArgument } from './read-target-directory-argument'

export function packageTargetFromCli(argv: string[], workspaceDirectory: string): {
  targetName: string
  tarballPath: string
  deployScriptPath: string
  selectedSurveys: string[]
} {
  const { targetName } = readTargetDirectoryArgument(argv, workspaceDirectory)
  const result = buildDeploymentPackage({ workspaceDirectory, targetName })

  return {
    targetName,
    tarballPath: result.tarballPath,
    deployScriptPath: result.deployScriptPath,
    selectedSurveys: result.selectedSurveys
  }
}

function main(): void {
  console.log(JSON.stringify(packageTargetFromCli(process.argv, process.cwd()), null, 2))
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
