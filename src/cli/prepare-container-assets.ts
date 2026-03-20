import { prepareGeneratedContainerLayout } from '../deploy/prepare-generated-container-layout'
import { readTargetNameArgument } from './read-target-name-argument'

function main(): void {
  const workspaceRoot = process.cwd()
  const targetName = readTargetNameArgument(process.argv, 'sample')
  const preparedLayout = prepareGeneratedContainerLayout({
    workspaceDirectory: workspaceRoot,
    targetName
  })

  console.log(
    JSON.stringify(
      {
        generatedRoot: preparedLayout.generatedRoot,
        containerRoot: preparedLayout.containerRoot,
        manifestPath: preparedLayout.manifestPath,
        deploymentTargetName: targetName,
        deployedSurveys: preparedLayout.surveys
      },
      null,
      2
    )
  )
}

main()
