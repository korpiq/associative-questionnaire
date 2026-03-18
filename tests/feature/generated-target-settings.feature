Feature: Build generated target settings for production assets
  Scenario: A loaded target produces survey HTML and CGI settings
    Given the loaded deployment target is:
      """
      {
        "targetName": "example-vps",
        "type": "ssh",
        "sshTarget": "deploy@example.test",
        "publicPath": "/srv/sites/example.test/www/./surveys",
        "cgiPath": "/srv/sites/example.test/www/./cgi-bin",
        "dataDir": "/srv/sites/example.test/www/./data",
        "protectionFile": "/srv/sites/example.test/www/./data/reporter-protection.txt",
        "publicBaseUrl": "https://example.test",
        "saverUrl": "https://example.test/cgi-bin/save-survey.js",
        "reporterUrl": "https://example.test/cgi-bin/report-survey.js",
        "createMissingSubpaths": true,
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
    Then the generated survey HTML settings are:
      """
      [
        {
          "surveyName": "basic",
          "surveyPath": "/workspace/targets/example-vps/surveys/basic/survey.json",
          "templatePath": "/workspace/targets/example-vps/surveys/basic/template.html",
          "publicHtmlFilename": "basic.html",
          "formAction": "https://example.test/cgi-bin/save-survey.js"
        },
        {
          "surveyName": "follow-up",
          "surveyPath": "/workspace/targets/example-vps/surveys/follow-up/survey.json",
          "templatePath": "/workspace/targets/example-vps/surveys/follow-up/template.html",
          "publicHtmlFilename": "follow-up.html",
          "formAction": "https://example.test/cgi-bin/save-survey.js"
        }
      ]
      """
    And the generated saver CGI settings are:
      """
      {
        "surveysDataDir": "/srv/sites/example.test/www/./data/surveys",
        "answersDataDir": "/srv/sites/example.test/www/./data/answers"
      }
      """
    And the generated reporter CGI settings are:
      """
      {
        "surveysDataDir": "/srv/sites/example.test/www/./data/surveys",
        "answersDataDir": "/srv/sites/example.test/www/./data/answers",
        "protectionFile": "/srv/sites/example.test/www/./data/reporter-protection.txt"
      }
      """
