import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { installGeneratedContainerRuntimeData } from '../src/deploy/install-generated-container-runtime-data'

const createdDirectories: string[] = []

afterEach(() => {
  createdDirectories.forEach((directory) => {
    rmSync(directory, { recursive: true, force: true })
  })
  createdDirectories.length = 0
})

describe('installGeneratedContainerRuntimeData', () => {
  it('copies generated surveys and seeded answers into the configured runtime directories', () => {
    const workspaceDirectory = mkdtempSync(join(process.cwd(), '.test-container-runtime-'))
    createdDirectories.push(workspaceDirectory)

    const generatedSurveyRoot = join(workspaceDirectory, 'generated', 'surveys')
    const generatedAnswersRoot = join(workspaceDirectory, 'generated', 'answers')
    const surveysDataDir = join(workspaceDirectory, 'runtime', 'surveys')
    const answersDataDir = join(workspaceDirectory, 'runtime', 'answers')

    mkdirSync(generatedSurveyRoot, { recursive: true })
    mkdirSync(join(generatedAnswersRoot, 'survey'), { recursive: true })

    writeFileSync(join(generatedSurveyRoot, 'survey.json'), '{"title":"Example survey"}')
    writeFileSync(join(generatedAnswersRoot, 'survey', 'respondent.json'), '{"answers":{}}')

    installGeneratedContainerRuntimeData({
      generatedSurveyRoot,
      generatedAnswersRoot,
      surveysDataDir,
      answersDataDir
    })

    expect(readFileSync(join(surveysDataDir, 'survey.json'), 'utf8')).toBe(
      '{"title":"Example survey"}'
    )
    expect(readFileSync(join(answersDataDir, 'survey', 'respondent.json'), 'utf8')).toBe(
      '{"answers":{}}'
    )
  })
})
