import { describe, expect, it } from 'vitest'

import { normalizeSurvey, parseSurvey } from '../src'

describe('normalizeSurvey', () => {
  it('preserves keyed source order and restores ids from keys', () => {
    const survey = parseSurvey({
      title: 'Example survey',
      sections: {
        basics: {
          title: 'Basics',
          questions: {
            hobbies: {
              title: 'Hobbies',
              type: 'multi-choice',
              content: {
                music: 'Music',
                sports: 'Sports'
              }
            },
            matches: {
              title: 'Associate phrases',
              type: 'associative',
              content: {
                left: {
                  '1': 'Calm',
                  '2': 'Precise'
                },
                right: {
                  A: 'Blue',
                  B: 'Green'
                }
              }
            }
          }
        },
        notes: {
          title: 'Notes',
          questions: {
            freeform: {
              title: 'Notes',
              type: 'free-text'
            }
          }
        }
      }
    })

    const normalized = normalizeSurvey(survey)

    expect(normalized).toMatchObject({
      title: 'Example survey',
      sections: [
        {
          id: 'basics',
          title: 'Basics',
          questions: [
            {
              id: 'hobbies',
              type: 'multi-choice',
              content: [
                { id: 'music', text: 'Music' },
                { id: 'sports', text: 'Sports' }
              ]
            },
            {
              id: 'matches',
              type: 'associative',
              content: {
                left: [
                  { id: '1', text: 'Calm' },
                  { id: '2', text: 'Precise' }
                ],
                right: [
                  { id: 'A', text: 'Blue' },
                  { id: 'B', text: 'Green' }
                ]
              }
            }
          ]
        },
        {
          id: 'notes',
          title: 'Notes',
          questions: [
            {
              id: 'freeform',
              type: 'free-text'
            }
          ]
        }
      ]
    })
  })
})
