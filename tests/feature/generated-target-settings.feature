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
        "publicBaseUrl": "https://example.test",
        "cgiBaseUrl": "https://example.test/cgi-bin",
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
          "publicUrl": "https://example.test/basic/",
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
          "publicUrl": "https://example.test/follow-up/",
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
