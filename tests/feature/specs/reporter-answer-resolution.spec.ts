import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { afterAll, expect } from 'vitest'

import { resolveStoredReporterSurvey } from '../../../src'

const feature = await loadFeature('tests/feature/reporter-answer-resolution.feature')

describeFeature(feature, ({ Scenario }) => {
  const createdHomeDirectories: string[] = []
  let effectiveHomeDirectory = ''
  let resolvedReporterSurvey:
    | ReturnType<typeof resolveStoredReporterSurvey>
    | undefined
  let resolutionError: Error | null

  afterAll(() => {
    createdHomeDirectories.forEach((directory) => {
      rmSync(directory, { recursive: true, force: true })
    })
  })

  function surveyRoot(name: string): string {
    return join(
      effectiveHomeDirectory,
      '.local',
      'share',
      'associative-survey',
      'surveys',
      `${name}.json`
    )
  }

  function answerRoot(name: string): string {
    return join(
      effectiveHomeDirectory,
      '.local',
      'share',
      'associative-survey',
      'answers',
      name
    )
  }

  Scenario('Valid raw stored answer files are normalized during reporter resolution', ({ Given, And, When, Then }) => {
    Given('an empty reporter answer resolution home directory', () => {
      effectiveHomeDirectory = mkdtempSync(join(process.cwd(), '.test-reporter-answer-home-'))
      createdHomeDirectories.push(effectiveHomeDirectory)
      resolvedReporterSurvey = undefined
      resolutionError = null
    })

    And('a stored reporter survey named {string} exists', (_ctx, surveyName) => {
      mkdirSync(join(effectiveHomeDirectory, '.local', 'share', 'associative-survey', 'surveys'), {
        recursive: true
      })
      writeFileSync(
        surveyRoot(surveyName),
        JSON.stringify({
          title: 'Example survey',
          sections: {
            basics: {
              title: 'Basics',
              questions: {
                'favorite-color': {
                  title: 'Favorite color',
                  type: 'single-choice',
                  content: {
                    red: 'Red',
                    blue: 'Blue'
                  }
                },
                matches: {
                  title: 'Associate phrases',
                  type: 'associative',
                  content: {
                    left: {
                      '1': 'Calm'
                    },
                    right: {
                      A: 'Blue'
                    }
                  }
                }
              }
            }
          }
        })
      )
    })

    And('a valid raw stored answer file exists for that survey', () => {
      mkdirSync(answerRoot('example-survey'), { recursive: true })
      writeFileSync(
        join(answerRoot('example-survey'), 'respondent.json'),
        JSON.stringify({
          requestBody: 'favorite-color=blue'
        })
      )
    })

    When('the reporter resolves stored survey data for {string}', (_ctx, surveyName) => {
      try {
        resolvedReporterSurvey = resolveStoredReporterSurvey(surveyName, effectiveHomeDirectory)
        resolutionError = null
      } catch (error) {
        resolvedReporterSurvey = undefined
        resolutionError = error as Error
      }
    })

    Then('the resolved validated answer file count is {int}', (_ctx, count) => {
      expect(resolutionError).toBeNull()
      expect(resolvedReporterSurvey?.validatedAnswerFiles).toHaveLength(count)
    })

    And(
      'the first resolved validated answer contains question {string} with value {string}',
      (_ctx, questionId, value) => {
        expect(resolvedReporterSurvey?.validatedAnswerFiles[0]?.answers[questionId]).toMatchObject({
          value
        })
      }
    )
  })

  Scenario('Invalid associative raw stored answer files are rejected during reporter resolution', ({ Given, And, When, Then }) => {
    Given('an empty reporter answer resolution home directory', () => {
      effectiveHomeDirectory = mkdtempSync(join(process.cwd(), '.test-reporter-answer-home-'))
      createdHomeDirectories.push(effectiveHomeDirectory)
      resolvedReporterSurvey = undefined
      resolutionError = null
    })

    And('a stored reporter survey named {string} exists', (_ctx, surveyName) => {
      mkdirSync(join(effectiveHomeDirectory, '.local', 'share', 'associative-survey', 'surveys'), {
        recursive: true
      })
      writeFileSync(
        surveyRoot(surveyName),
        JSON.stringify({
          title: 'Example survey',
          sections: {
            basics: {
              title: 'Basics',
              questions: {
                'favorite-color': {
                  title: 'Favorite color',
                  type: 'single-choice',
                  content: {
                    red: 'Red',
                    blue: 'Blue'
                  }
                },
                matches: {
                  title: 'Associate phrases',
                  type: 'associative',
                  content: {
                    left: {
                      '1': 'Calm'
                    },
                    right: {
                      A: 'Blue'
                    }
                  }
                }
              }
            }
          }
        })
      )
    })

    And('an invalid associative raw stored answer file exists for that survey', () => {
      mkdirSync(answerRoot('example-survey'), { recursive: true })
      writeFileSync(
        join(answerRoot('example-survey'), 'respondent.json'),
        JSON.stringify({
          requestBody: 'favorite-color=blue&matches=not-json'
        })
      )
    })

    When('the reporter resolves stored survey data for {string}', (_ctx, surveyName) => {
      try {
        resolvedReporterSurvey = resolveStoredReporterSurvey(surveyName, effectiveHomeDirectory)
        resolutionError = null
      } catch (error) {
        resolvedReporterSurvey = undefined
        resolutionError = error as Error
      }
    })

    Then('reporter answer resolution is rejected', () => {
      expect(resolvedReporterSurvey).toBeUndefined()
      expect(resolutionError).toBeInstanceOf(Error)
    })
  })

  Scenario(
    'Raw stored answers that do not match the survey definition are rejected during reporter resolution',
    ({ Given, And, When, Then }) => {
      Given('an empty reporter answer resolution home directory', () => {
        effectiveHomeDirectory = mkdtempSync(join(process.cwd(), '.test-reporter-answer-home-'))
        createdHomeDirectories.push(effectiveHomeDirectory)
        resolvedReporterSurvey = undefined
        resolutionError = null
      })

      And('a stored reporter survey named {string} exists', (_ctx, surveyName) => {
        mkdirSync(join(effectiveHomeDirectory, '.local', 'share', 'associative-survey', 'surveys'), {
          recursive: true
        })
        writeFileSync(
          surveyRoot(surveyName),
          JSON.stringify({
            title: 'Example survey',
            sections: {
              basics: {
                title: 'Basics',
                questions: {
                  'favorite-color': {
                    title: 'Favorite color',
                    type: 'single-choice',
                    content: {
                      red: 'Red',
                      blue: 'Blue'
                    }
                  },
                  matches: {
                    title: 'Associate phrases',
                    type: 'associative',
                    content: {
                      left: {
                        '1': 'Calm'
                      },
                      right: {
                        A: 'Blue'
                      }
                    }
                  }
                }
              }
            }
          })
        )
      })

      And('a mismatched raw stored answer file exists for that survey', () => {
        mkdirSync(answerRoot('example-survey'), { recursive: true })
        writeFileSync(
          join(answerRoot('example-survey'), 'respondent.json'),
          JSON.stringify({
            requestBody: 'favorite-color=green'
          })
        )
      })

    When('the reporter resolves stored survey data for {string}', (_ctx, surveyName) => {
      try {
        resolvedReporterSurvey = resolveStoredReporterSurvey(surveyName, effectiveHomeDirectory)
        resolutionError = null
      } catch (error) {
        resolvedReporterSurvey = undefined
        resolutionError = error as Error
      }
    })

    Then('reporter answer resolution is rejected', () => {
      expect(resolvedReporterSurvey).toBeUndefined()
      expect(resolutionError).toBeInstanceOf(Error)
    })
  })
})
