export type ParsedDeploymentPath = {
  existingRoot: string
  createableSubpath: string
  fullPath: string
}

export function parseDeploymentPath(configuredPath: string): ParsedDeploymentPath {
  return {
    existingRoot: configuredPath,
    createableSubpath: '',
    fullPath: configuredPath
  }
}
