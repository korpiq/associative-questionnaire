import { z } from 'zod'

const deploymentTargetConfigSchema = z
  .object({
    type: z.enum(['container', 'ssh']),
    sshTarget: z.string().min(1).optional(),
    containerName: z.string().min(1).optional(),
    publicDir: z.string().min(1),
    cgiDir: z.string().min(1),
    dataDir: z.string().min(1),
    baseUrl: z
      .string()
      .url()
      .refine((value) => {
        const url = new URL(value)

        return !url.port && (!url.pathname || url.pathname === '/') && !url.search && !url.hash
      }, 'baseUrl must include only scheme and host'),
    port: z.number().int().positive().max(65535).optional(),
    staticUriPath: z.string().min(1).regex(/^\//, 'URI paths must start with /'),
    cgiUriPath: z.string().min(1).regex(/^\//, 'URI paths must start with /'),
    nodeExecutable: z.string().min(1),
    cgiExtension: z.string().regex(/^\./, 'CGI extension must start with a dot')
  })
  .strict()

type ParsedDeploymentTargetConfigBase = {
  targetName: string
  publicDir: string
  cgiDir: string
  dataDir: string
  baseUrl: string
  port?: number
  staticUriPath: string
  cgiUriPath: string
  nodeExecutable: string
  cgiExtension: string
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
  let parsedConfig: z.infer<typeof deploymentTargetConfigSchema>

  try {
    parsedConfig = deploymentTargetConfigSchema.parse(parsedJson)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.issues[0]?.message ?? 'Invalid deployment target configuration')
    }

    throw error
  }

  if (parsedConfig.type === 'ssh' && !parsedConfig.sshTarget) {
    throw new Error('SSH targets must define sshTarget')
  }

  if (parsedConfig.type === 'container' && !parsedConfig.containerName) {
    throw new Error('Container targets must define containerName')
  }

  const baseConfig = {
    targetName,
    publicDir: parsedConfig.publicDir,
    cgiDir: parsedConfig.cgiDir,
    dataDir: parsedConfig.dataDir,
    baseUrl: parsedConfig.baseUrl,
    ...(parsedConfig.port === undefined ? {} : { port: parsedConfig.port }),
    staticUriPath: parsedConfig.staticUriPath,
    cgiUriPath: parsedConfig.cgiUriPath,
    nodeExecutable: parsedConfig.nodeExecutable,
    cgiExtension: parsedConfig.cgiExtension
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
