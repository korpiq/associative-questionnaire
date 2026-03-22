import { spawnSync } from 'node:child_process'

export function installPreparedContainerTarget(
  containerName: string,
  targetName = 'sample'
): void {
  const result = spawnSync(
    'node',
    [
      '--import',
      'tsx',
      'src/cli/install-prepared-container-target.ts',
      targetName,
      '--container-name',
      containerName
    ],
    {
      cwd: process.cwd(),
      encoding: 'utf8'
    }
  )
  const output = `${result.stdout}${result.stderr}`

  if (result.status !== 0) {
    throw new Error(
      `Command failed: node --import tsx src/cli/install-prepared-container-target.ts ${targetName} --container-name ${containerName}\n${output}`.trim()
    )
  }
}
