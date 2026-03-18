import { z } from 'zod'

const deploymentTargetConfigSchema = z
  .object({
    type: z.enum(['container', 'ssh']),
    sshTarget: z.string().min(1).optional(),
    containerName: z.string().min(1).optional(),
    publicPath: z.string().min(1),
    cgiPath: z.string().min(1),
    dataDir: z.string().min(1),
    protectionFile: z.string().min(1).optional(),
    publicBaseUrl: z.string().url(),
    saverUrl: z.string().url(),
    reporterUrl: z.string().url(),
    createMissingSubpaths: z.boolean().optional()
  })
  .strict()

type ParsedDeploymentTargetConfigBase = {
  targetName: string
  publicPath: string
  cgiPath: string
  dataDir: string
  protectionFile: string
  publicBaseUrl: string
  saverUrl: string
  reporterUrl: string
  createMissingSubpaths: boolean
}

export type ParsedDeploymentTargetConfig =
  | (ParsedDeploymentTargetConfigBase & {
      type: 'ssh'
      sshTarget: string
    })
  | (ParsedDeploymentTargetConfigBase & {
      type: 'container'
      containerName: string
    })

function normalizeTargetName(targetName: string): string {
  if (!targetName.trim()) {
    throw new Error('Target name must not be empty')
  }

  return targetName
}

export function parseDeploymentTargetConfig(input: {
  targetName: string
  targetConfigurationJson: string
}): ParsedDeploymentTargetConfig {
  const targetName = normalizeTargetName(input.targetName)
  const parsedJson = JSON.parse(input.targetConfigurationJson) as unknown
  const parsedConfig = deploymentTargetConfigSchema.parse(parsedJson)

  if (parsedConfig.type === 'ssh' && !parsedConfig.sshTarget) {
    throw new Error('SSH targets must define sshTarget')
  }

  if (parsedConfig.type === 'container' && !parsedConfig.containerName) {
    throw new Error('Container targets must define containerName')
  }

  const baseConfig = {
    targetName,
    publicPath: parsedConfig.publicPath,
    cgiPath: parsedConfig.cgiPath,
    dataDir: parsedConfig.dataDir,
    protectionFile: parsedConfig.protectionFile ?? `${parsedConfig.dataDir}/protection.txt`,
    publicBaseUrl: parsedConfig.publicBaseUrl,
    saverUrl: parsedConfig.saverUrl,
    reporterUrl: parsedConfig.reporterUrl,
    createMissingSubpaths: parsedConfig.createMissingSubpaths ?? true
  }

  if (parsedConfig.type === 'ssh') {
    const sshTarget = parsedConfig.sshTarget

    if (!sshTarget) {
      throw new Error('SSH targets must define sshTarget')
    }

    return {
      ...baseConfig,
      type: 'ssh',
      sshTarget
    }
  }

  const containerName = parsedConfig.containerName

  if (!containerName) {
    throw new Error('Container targets must define containerName')
  }

  return {
    ...baseConfig,
    type: 'container',
    containerName
  }
}
