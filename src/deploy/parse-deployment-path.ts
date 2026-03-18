export type ParsedDeploymentPath = {
  existingRoot: string
  createableSubpath: string
  fullPath: string
}

export function parseDeploymentPath(configuredPath: string): ParsedDeploymentPath {
  const splitMarker = '/./'
  const splitParts = configuredPath.split(splitMarker)

  if (splitParts.length > 2) {
    throw new Error('Deployment paths may contain at most one /./ split marker')
  }

  if (splitParts.length === 1) {
    return {
      existingRoot: configuredPath,
      createableSubpath: '',
      fullPath: configuredPath
    }
  }

  const existingRoot = splitParts[0]
  const createableSubpath = splitParts[1]

  if (!existingRoot || !createableSubpath) {
    throw new Error(
      'Deployment paths with /./ must include a createable subpath to the right of the split marker'
    )
  }

  return {
    existingRoot,
    createableSubpath,
    fullPath: `${existingRoot}/${createableSubpath}`
  }
}
