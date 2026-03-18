import { describe, expect, it } from 'vitest'

import { listTargetDeployedSurveys } from '../src/deploy/list-target-deployed-surveys'
import type { LoadedDeploymentTarget } from '../src/deploy/load-deployment-target'

describe('listTargetDeployedSurveys', () => {
  it('maps discovered target surveys into generated public survey pages', () => {
    const target: LoadedDeploymentTarget = {
      targetName: 'sample',
      type: 'container',
      containerName: 'associative-survey-local',
      publicPath: '/srv/www/./surveys',
      cgiPath: '/srv/www/./cgi-bin',
      dataDir: '/srv/data/./surveys',
      protectionFile: '/srv/data/./surveys/protection.txt',
      publicBaseUrl: 'http://127.0.0.1:18080',
      saverUrl: 'http://127.0.0.1:18080/cgi-bin/save-survey.js',
      reporterUrl: 'http://127.0.0.1:18080/cgi-bin/report-survey.js',
      createMissingSubpaths: true,
      targetDirectory: '/workspace/targets/sample',
      surveys: [
        {
          surveyName: 'survey',
          surveyDirectory: '/workspace/targets/sample/surveys/survey',
          surveyPath: '/workspace/targets/sample/surveys/survey/survey.json',
          templatePath: '/workspace/targets/sample/surveys/survey/template.html'
        },
        {
          surveyName: 'override-survey',
          surveyDirectory: '/workspace/targets/sample/surveys/override-survey',
          surveyPath: '/workspace/targets/sample/surveys/override-survey/survey.json',
          templatePath: '/workspace/targets/sample/surveys/override-survey/template.html'
        }
      ]
    }

    expect(listTargetDeployedSurveys(target)).toEqual([
      {
        publicHtmlFilename: 'survey.html',
        surveyName: 'survey',
        surveyPath: '/workspace/targets/sample/surveys/survey/survey.json',
        templatePath: '/workspace/targets/sample/surveys/survey/template.html'
      },
      {
        publicHtmlFilename: 'override-survey.html',
        surveyName: 'override-survey',
        surveyPath: '/workspace/targets/sample/surveys/override-survey/survey.json',
        templatePath: '/workspace/targets/sample/surveys/override-survey/template.html'
      }
    ])
  })
})
