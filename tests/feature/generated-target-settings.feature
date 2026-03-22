Feature: Build generated target settings for production assets
  Scenario: A loaded target produces per-survey public, CGI, and private-data settings
    Given the loaded deployment target is:
      """
      {
        "targetName": "example-vps",
        "type": "ssh",
        "sshTarget": "deploy@example.test",
        "publicDir": "/srv/sites/example.test/www/surveys",
        "cgiDir": "/srv/sites/example.test/www/cgi-bin",
        "dataDir": "/srv/sites/example.test/www/data",
        "baseUrl": "https://example.test",
        "staticUriPath": "/surveys",
        "cgiUriPath": "/cgi-bin",
        "nodeExecutable": "/usr/local/bin/node",
        "cgiExtension": ".cgi",
        "targetDirectory": "/workspace/targets/example-vps",
        "surveys": [
          {
            "surveyName": "basic",
            "surveyDirectory": "/workspace/targets/example-vps/surveys/basic",
            "surveyPath": "/workspace/targets/example-vps/surveys/basic/survey.json",
            "templatePath": "/workspace/targets/example-vps/surveys/basic/template.html"
          },
          {
            "surveyName": "follow-up",
            "surveyDirectory": "/workspace/targets/example-vps/surveys/follow-up",
            "surveyPath": "/workspace/targets/example-vps/surveys/follow-up/survey.json",
            "templatePath": "/workspace/targets/example-vps/surveys/follow-up/template.html"
          }
        ]
      }
      """
    When the generated target settings are built
    Then the generated survey deployment settings are:
      """
      [
        {
          "surveyName": "basic",
          "surveyPath": "/workspace/targets/example-vps/surveys/basic/survey.json",
          "templatePath": "/workspace/targets/example-vps/surveys/basic/template.html",
          "publicDir": "/srv/sites/example.test/www/surveys/basic",
          "publicUrl": "https://example.test/surveys/basic/",
          "publicHtmlFilename": "index.html",
          "cgiDir": "/srv/sites/example.test/www/cgi-bin/basic",
          "saveCgiFilename": "save.cgi",
          "saveUrl": "https://example.test/cgi-bin/basic/save.cgi",
          "reportCgiFilename": "report.cgi",
          "reportUrl": "https://example.test/cgi-bin/basic/report.cgi",
          "privateDataDir": "/srv/sites/example.test/www/data/basic",
          "privateSurveyPath": "/srv/sites/example.test/www/data/basic/survey.json",
          "privateAnswersDir": "/srv/sites/example.test/www/data/basic/answers"
        },
        {
          "surveyName": "follow-up",
          "surveyPath": "/workspace/targets/example-vps/surveys/follow-up/survey.json",
          "templatePath": "/workspace/targets/example-vps/surveys/follow-up/template.html",
          "publicDir": "/srv/sites/example.test/www/surveys/follow-up",
          "publicUrl": "https://example.test/surveys/follow-up/",
          "publicHtmlFilename": "index.html",
          "cgiDir": "/srv/sites/example.test/www/cgi-bin/follow-up",
          "saveCgiFilename": "save.cgi",
          "saveUrl": "https://example.test/cgi-bin/follow-up/save.cgi",
          "reportCgiFilename": "report.cgi",
          "reportUrl": "https://example.test/cgi-bin/follow-up/report.cgi",
          "privateDataDir": "/srv/sites/example.test/www/data/follow-up",
          "privateSurveyPath": "/srv/sites/example.test/www/data/follow-up/survey.json",
          "privateAnswersDir": "/srv/sites/example.test/www/data/follow-up/answers"
        }
      ]
      """

  Scenario: A loaded target uses its configured non-default port in generated URLs
    Given the loaded deployment target is:
      """
      {
        "targetName": "local-container",
        "type": "container",
        "containerName": "associative-survey-local",
        "publicDir": "/srv/www/surveys",
        "cgiDir": "/srv/www/cgi-bin",
        "dataDir": "/srv/www/data",
        "baseUrl": "http://127.0.0.1",
        "port": 18080,
        "staticUriPath": "/surveys",
        "cgiUriPath": "/cgi-bin",
        "nodeExecutable": "/usr/local/bin/node",
        "cgiExtension": ".cgi",
        "targetDirectory": "/workspace/targets/local-container",
        "surveys": [
          {
            "surveyName": "survey",
            "surveyDirectory": "/workspace/targets/local-container/surveys/survey",
            "surveyPath": "/workspace/targets/local-container/surveys/survey/survey.json",
            "templatePath": "/workspace/targets/local-container/surveys/survey/template.html"
          }
        ]
      }
      """
    When the generated target settings are built
    Then the generated survey deployment settings are:
      """
      [
        {
          "surveyName": "survey",
          "surveyPath": "/workspace/targets/local-container/surveys/survey/survey.json",
          "templatePath": "/workspace/targets/local-container/surveys/survey/template.html",
          "publicDir": "/srv/www/surveys/survey",
          "publicUrl": "http://127.0.0.1:18080/surveys/survey/",
          "publicHtmlFilename": "index.html",
          "cgiDir": "/srv/www/cgi-bin/survey",
          "saveCgiFilename": "save.cgi",
          "saveUrl": "http://127.0.0.1:18080/cgi-bin/survey/save.cgi",
          "reportCgiFilename": "report.cgi",
          "reportUrl": "http://127.0.0.1:18080/cgi-bin/survey/report.cgi",
          "privateDataDir": "/srv/www/data/survey",
          "privateSurveyPath": "/srv/www/data/survey/survey.json",
          "privateAnswersDir": "/srv/www/data/survey/answers"
        }
      ]
      """
