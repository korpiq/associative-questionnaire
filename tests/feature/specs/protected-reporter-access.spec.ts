import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { afterAll, expect } from 'vitest'

import {
  deriveProtectedSurveyAccessHash,
  resolveStoredReporterSurvey,
  storeUploadedReporterSurvey
} from '../../../src'

const feature = await loadFeature('tests/feature/protected-reporter-access.feature')

describeFeature(feature, ({ Scenario, defineSteps }) => {
  const createdHomeDirectories: string[] = []
  let effectiveHomeDirectory = ''
  let surveyName = ''
  let replacementUploadedSurveyFilename = ''
  let replacementUploadedSurveyJson = ''
  let protectionSecret = ''
  let accessError: Error | null
  let resolvedSurveyTitle = ''

  afterAll(() => {
    createdHomeDirectories.forEach((directory) => {
      rmSync(directory, { recursive: true, force: true })
    })
  })

  function resetState(): void {
    surveyName = ''
    replacementUploadedSurveyFilename = ''
    replacementUploadedSurveyJson = ''
    protectionSecret = ''
    accessError = null
    resolvedSurveyTitle = ''
  }

  function validHash(): string {
    return deriveProtectedSurveyAccessHash(surveyName, protectionSecret)
  }

  defineSteps(({ Then }) => {
    Then('protected reporter access is rejected with {string}', (_ctx, message) => {
      expect(accessError).toBeInstanceOf(Error)
      expect(accessError?.message).toBe(message)
    })
  })

  Scenario(
    'Replacing a protected stored survey requires the correct protection hash',
    ({ Given, And, When, Then }) => {
      Given('an empty protected reporter home directory', () => {
        effectiveHomeDirectory = mkdtempSync(join(process.cwd(), '.test-protected-reporter-home-'))
        createdHomeDirectories.push(effectiveHomeDirectory)
        resetState()
      })

      And('a protected stored survey named {string} exists', (_ctx, name) => {
        surveyName = name
        const surveysRoot = join(
          effectiveHomeDirectory,
          '.local',
          'share',
          'associative-survey',
          'surveys'
        )

        mkdirSync(surveysRoot, { recursive: true })
        writeFileSync(
          join(surveysRoot, `${surveyName}.json`),
          JSON.stringify({
            title: 'Protected survey',
            protected: true,
            sections: {
              basics: {
                title: 'Basics'
              }
            }
          })
        )
      })

      And('the replacement uploaded survey filename is {string}', (_ctx, filename) => {
        replacementUploadedSurveyFilename = filename
      })

      And('the replacement uploaded survey JSON is:', (_ctx, docString) => {
        replacementUploadedSurveyJson = docString ?? ''
      })

      And('the reporter protection secret is {string}', (_ctx, secret) => {
        protectionSecret = secret
      })

      When('the replacement uploaded survey is stored without a protection hash', () => {
        try {
          storeUploadedReporterSurvey({
            uploadedFilename: replacementUploadedSurveyFilename,
            uploadedJson: replacementUploadedSurveyJson,
            effectiveHomeDirectory,
            protectionSecret
          })
          accessError = null
        } catch (error) {
          accessError = error as Error
        }
      })

      When('the replacement uploaded survey is stored with the correct protection hash', () => {
        try {
          storeUploadedReporterSurvey({
            uploadedFilename: replacementUploadedSurveyFilename,
            uploadedJson: replacementUploadedSurveyJson,
            effectiveHomeDirectory,
            protectionSecret,
            protectionHash: validHash()
          })
          accessError = null
        } catch (error) {
          accessError = error as Error
        }
      })

      Then('the protected survey upload succeeds', () => {
        expect(accessError).toBeNull()
      })
    }
  )

  Scenario(
    'Resolving a protected stored survey report requires the correct protection hash',
    ({ Given, And, When, Then }) => {
      Given('an empty protected reporter home directory', () => {
        effectiveHomeDirectory = mkdtempSync(join(process.cwd(), '.test-protected-reporter-home-'))
        createdHomeDirectories.push(effectiveHomeDirectory)
        resetState()
      })

      And('a protected stored survey named {string} exists', (_ctx, name) => {
        surveyName = name
        const surveysRoot = join(
          effectiveHomeDirectory,
          '.local',
          'share',
          'associative-survey',
          'surveys'
        )

        mkdirSync(surveysRoot, { recursive: true })
        writeFileSync(
          join(surveysRoot, `${surveyName}.json`),
          JSON.stringify({
            title: 'Protected survey',
            protected: true,
            sections: {
              basics: {
                title: 'Basics'
              }
            }
          })
        )
      })

      And('the reporter protection secret is {string}', (_ctx, secret) => {
        protectionSecret = secret
      })

      When('the protected reporter survey is resolved without a hash', () => {
        try {
          const resolved = resolveStoredReporterSurvey(surveyName, effectiveHomeDirectory, {
            protectionSecret
          })
          resolvedSurveyTitle = resolved.survey.title
          accessError = null
        } catch (error) {
          accessError = error as Error
        }
      })

      When('the protected reporter survey is resolved with the correct protection hash', () => {
        try {
          const resolved = resolveStoredReporterSurvey(surveyName, effectiveHomeDirectory, {
            protectionSecret,
            protectionHash: validHash()
          })
          resolvedSurveyTitle = resolved.survey.title
          accessError = null
        } catch (error) {
          accessError = error as Error
        }
      })

      Then('the resolved protected survey title is {string}', (_ctx, title) => {
        expect(accessError).toBeNull()
        expect(resolvedSurveyTitle).toBe(title)
      })
    }
  )
})
