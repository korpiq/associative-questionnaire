import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { expect } from 'vitest'
import { parse as parseYaml } from 'yaml'

const feature = await loadFeature('tests/feature/container-dockerfile.feature')

describeFeature(feature, ({ Scenario }) => {
  let dockerfileContents = ''

  function parseYamlDocString<T>(docString: string | null | undefined): T {
    if (!docString) {
      throw new Error('Expected a YAML doc string in the feature step')
    }

    return parseYaml(docString) as T
  }

  Scenario('The runtime image does not bake in prepared deployment assets', ({ When, Then, And }) => {
    When('the container Dockerfile is inspected', () => {
      dockerfileContents = readFileSync(join(process.cwd(), 'Dockerfile'), 'utf8')
    })

    Then('the Dockerfile copy instructions are:', (_ctx, docString) => {
      const copyLines = dockerfileContents
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.startsWith('COPY '))

      expect(copyLines).toEqual(parseYamlDocString(docString))
    })

    And('the Dockerfile does not extract a deployable tarball at build time', () => {
      expect(dockerfileContents).not.toContain('deployable-container.tar.gz')
      expect(dockerfileContents).not.toContain('tar -xzf')
    })
  })
})
