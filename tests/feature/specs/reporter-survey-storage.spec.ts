import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'

import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { afterAll, expect } from 'vitest'

import { resolveStoredReporterSurvey, storeUploadedReporterSurvey } from '../../../src'

const feature = await loadFeature('tests/feature/reporter-survey-storage.feature')

describeFeature(feature, ({ Scenario }) => {
  const createdHomeDirectories: string[] = []
  let effectiveHomeDirectory = ''
  let uploadedSurveyFilename = ''
  let uploadedSurveyJson = ''
  let storedSurveyResult: {
    surveyName: string
    storedSurveyFilePath: string
  }
  let resolvedReporterSurvey: {
    survey: { title: string }
    answerFilePaths: string[]
  }

  afterAll(() => {
    createdHomeDirectories.forEach((directory) => {
      rmSync(directory, { recursive: true, force: true })
    })
  })

  Scenario('Uploaded survey JSON is stored under the runtime survey directory', ({ Given, And, When, Then }) => {
    Given('an empty reporter home directory', () => {
      effectiveHomeDirectory = mkdtempSync(join(process.cwd(), '.test-reporter-home-'))
      createdHomeDirectories.push(effectiveHomeDirectory)
      uploadedSurveyFilename = ''
      uploadedSurveyJson = ''
      storedSurveyResult = { surveyName: '', storedSurveyFilePath: '' }
      resolvedReporterSurvey = { survey: { title: '' }, answerFilePaths: [] }
    })

    And('the uploaded survey filename is {string}', (_ctx, filename) => {
      uploadedSurveyFilename = filename
    })

    And('the uploaded survey JSON is:', (_ctx, docString) => {
      uploadedSurveyJson = docString ?? ''
    })

    When('the uploaded survey is stored for the reporter', () => {
      storedSurveyResult = storeUploadedReporterSurvey({
        uploadedFilename: uploadedSurveyFilename,
        uploadedJson: uploadedSurveyJson,
        effectiveHomeDirectory
      })
    })

    Then('the stored survey name is {string}', (_ctx, surveyName) => {
      expect(storedSurveyResult.surveyName).toBe(surveyName)
    })

    And('the stored survey file path is {string}', (_ctx, relativePath) => {
      expect(relative(effectiveHomeDirectory, storedSurveyResult.storedSurveyFilePath)).toBe(relativePath)
    })

    And('the stored survey file contains the uploaded survey JSON', () => {
      expect(readFileSync(storedSurveyResult.storedSurveyFilePath, 'utf8')).toBe(uploadedSurveyJson)
    })
  })

  Scenario('Stored survey resolution uses survey name and finds answer files', ({ Given, And, When, Then }) => {
    Given('an empty reporter home directory', () => {
      effectiveHomeDirectory = mkdtempSync(join(process.cwd(), '.test-reporter-home-'))
      createdHomeDirectories.push(effectiveHomeDirectory)
      uploadedSurveyFilename = ''
      uploadedSurveyJson = ''
      storedSurveyResult = { surveyName: '', storedSurveyFilePath: '' }
      resolvedReporterSurvey = { survey: { title: '' }, answerFilePaths: [] }
    })

    And('the uploaded survey filename is {string}', (_ctx, filename) => {
      uploadedSurveyFilename = filename
    })

    And('the uploaded survey JSON is:', (_ctx, docString) => {
      uploadedSurveyJson = docString ?? ''
    })

    And('a saved answer file exists for the survey', () => {
      const answerDirectory = join(
        effectiveHomeDirectory,
        '.local',
        'share',
        'associative-survey',
        'answers',
        'example-survey'
      )
      mkdirSync(answerDirectory, { recursive: true })
      writeFileSync(
        join(answerDirectory, 'respondent.json'),
        JSON.stringify({
          surveyTitle: 'Example survey',
          answers: {
            'favorite-color': {
              type: 'single-choice',
              value: 'blue'
            }
          }
        })
      )
    })

    When('the uploaded survey is stored for the reporter', () => {
      storedSurveyResult = storeUploadedReporterSurvey({
        uploadedFilename: uploadedSurveyFilename,
        uploadedJson: uploadedSurveyJson,
        effectiveHomeDirectory
      })
    })

    And('the reporter resolves the stored survey by survey name', () => {
      resolvedReporterSurvey = resolveStoredReporterSurvey(
        storedSurveyResult.surveyName,
        effectiveHomeDirectory
      )
    })

    Then('the resolved survey title is {string}', (_ctx, title) => {
      expect(resolvedReporterSurvey.survey.title).toBe(title)
    })

    And('the resolved answer file count is {int}', (_ctx, count) => {
      expect(resolvedReporterSurvey.answerFilePaths).toHaveLength(count)
    })
  })

  Scenario(
    'Legacy protected stored surveys can be replaced and resolved without protection inputs',
    ({ Given, And, When, Then }) => {
      Given('an empty reporter home directory', () => {
        effectiveHomeDirectory = mkdtempSync(join(process.cwd(), '.test-reporter-home-'))
        createdHomeDirectories.push(effectiveHomeDirectory)
        uploadedSurveyFilename = ''
        uploadedSurveyJson = ''
        storedSurveyResult = { surveyName: '', storedSurveyFilePath: '' }
        resolvedReporterSurvey = { survey: { title: '' }, answerFilePaths: [] }
      })

      And('a legacy protected stored reporter survey named {string} exists', (_ctx, surveyName) => {
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
            title: 'Legacy protected survey',
            protected: true,
            sections: {
              basics: {
                title: 'Basics'
              }
            }
          })
        )
      })

      And('the uploaded survey filename is {string}', (_ctx, filename) => {
        uploadedSurveyFilename = filename
      })

      And('the uploaded survey JSON is:', (_ctx, docString) => {
        uploadedSurveyJson = docString ?? ''
      })

      When('the uploaded survey is stored for the reporter', () => {
        storedSurveyResult = storeUploadedReporterSurvey({
          uploadedFilename: uploadedSurveyFilename,
          uploadedJson: uploadedSurveyJson,
          effectiveHomeDirectory
        })
      })

      And('the reporter resolves the stored survey by survey name', () => {
        resolvedReporterSurvey = resolveStoredReporterSurvey(
          storedSurveyResult.surveyName,
          effectiveHomeDirectory
        )
      })

      Then('the resolved survey title is {string}', (_ctx, title) => {
        expect(resolvedReporterSurvey.survey.title).toBe(title)
      })
    }
  )
})
