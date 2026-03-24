import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { expect } from 'vitest'
import { parse as parseYaml } from 'yaml'

import { buildGeneratedSurveyArtifacts } from '../../../src'
import type { GeneratedSurveyDeploymentSettings } from '../../../src/deploy/build-generated-target-settings'

const feature = await loadFeature('tests/feature/generated-survey-deployment-artifacts.feature')

describeFeature(feature, ({ Scenario }) => {
  let surveyJson = ''
  let surveyTemplate = ''
  let saverScriptTemplate = ''
  let reporterScriptTemplate = ''
  let surveySettings: GeneratedSurveyDeploymentSettings = {
    surveyName: '',
    surveyPath: '',
    templatePath: '',
    publicDir: '',
    publicUrl: '',
    publicHtmlFilename: '',
    okUrl: '',
    failUrl: '',
    cgiDir: '',
    saveCgiFilename: '',
    saveUrl: '',
    reportCgiFilename: '',
    reportUrl: '',
    privateDataDir: '',
    privateSurveyPath: '',
    privateAnswersDir: ''
  }
  let nodeExecutable = ''
  let generatedArtifacts: ReturnType<typeof buildGeneratedSurveyArtifacts> | null = null

  function parseYamlDocString<T>(docString: string | null | undefined): T {
    if (!docString) {
      throw new Error('Expected a YAML doc string in the feature step')
    }

    return parseYaml(docString) as T
  }

  function getArtifactContents(kind: 'publicFiles' | 'cgiFiles' | 'privateFiles', relativePath: string): string {
    const artifact = generatedArtifacts?.[kind].find((file) => file.relativePath === relativePath)

    if (!artifact) {
      throw new Error(`Expected generated ${kind} artifact at ${relativePath}`)
    }

    return artifact.contents
  }

  Scenario('A survey produces the canonical public, CGI, and private files', ({ Given, And, When, Then }) => {
    Given('the survey definition JSON is:', (_ctx, docString) => {
      surveyJson = (docString ?? '').trim()
      surveyTemplate = ''
      saverScriptTemplate = ''
      reporterScriptTemplate = ''
      nodeExecutable = ''
      generatedArtifacts = null
    })

    And('the survey HTML template is:', (_ctx, docString) => {
      surveyTemplate = docString ?? ''
    })

    And('the saver CGI template is:', (_ctx, docString) => {
      saverScriptTemplate = docString ?? ''
    })

    And('the reporter CGI template is:', (_ctx, docString) => {
      reporterScriptTemplate = docString ?? ''
    })

    And('the generated survey deployment settings are:', (_ctx, docString) => {
      surveySettings = parseYamlDocString(docString)
    })

    And('the target node executable is:', (_ctx, docString) => {
      nodeExecutable = (docString ?? '').trim()
    })

    When('the survey deployment artifacts are built', () => {
      generatedArtifacts = buildGeneratedSurveyArtifacts({
        surveyJson,
        surveyTemplate,
        saverScriptTemplate,
        reporterScriptTemplate,
        surveySettings,
        nodeExecutable
      })
    })

    Then('the generated public artifact paths are:', (_ctx, docString) => {
      expect(generatedArtifacts?.publicFiles.map((file) => file.relativePath)).toEqual(
        parseYamlDocString(docString)
      )
    })

    And('the generated CGI artifact paths are:', (_ctx, docString) => {
      expect(generatedArtifacts?.cgiFiles.map((file) => file.relativePath)).toEqual(
        parseYamlDocString(docString)
      )
    })

    And('the generated private artifact paths are:', (_ctx, docString) => {
      expect(generatedArtifacts?.privateFiles.map((file) => file.relativePath)).toEqual(
        parseYamlDocString(docString)
      )
    })

    And('the generated public artifacts contain:', (_ctx, docString) => {
      const expectedFragmentsByPath = parseYamlDocString<Record<string, string[]>>(docString)

      Object.entries(expectedFragmentsByPath).forEach(([relativePath, expectedFragments]) => {
        const contents = getArtifactContents('publicFiles', relativePath)

        expectedFragments.forEach((text) => {
          expect(contents).toContain(text)
        })
      })
    })

    And('the generated CGI artifacts contain:', (_ctx, docString) => {
      const expectedFragmentsByPath = parseYamlDocString<Record<string, string[]>>(docString)

      Object.entries(expectedFragmentsByPath).forEach(([relativePath, expectedFragments]) => {
        const contents = getArtifactContents('cgiFiles', relativePath)

        expectedFragments.forEach((text) => {
          expect(contents).toContain(text)
        })
      })
    })

    And('the generated CGI artifacts omit:', (_ctx, docString) => {
      const omittedFragmentsByPath = parseYamlDocString<Record<string, string[]>>(docString)

      Object.entries(omittedFragmentsByPath).forEach(([relativePath, omittedFragments]) => {
        const contents = getArtifactContents('cgiFiles', relativePath)

        omittedFragments.forEach((text) => {
          expect(contents).not.toContain(text)
        })
      })
    })

    And('all generated CGI artifacts start with the target node executable', () => {
      const expectedShebangPrefix = `#!${nodeExecutable}`

      generatedArtifacts?.cgiFiles.forEach((artifact) => {
        expect(artifact.contents.startsWith(expectedShebangPrefix)).toBe(true)
      })
    })

    And('the generated private artifact {string} is:', (_ctx, relativePath, docString) => {
      expect(JSON.parse(getArtifactContents('privateFiles', relativePath))).toEqual(
        JSON.parse((docString ?? '').trim())
      )
    })
  })
})
