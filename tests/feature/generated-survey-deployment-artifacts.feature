Feature: Build generated per-survey deployment artifacts
  Scenario: A survey produces the canonical public, CGI, and private files
    Given the survey definition JSON is:
      """
      {
        "title": "Example survey",
        "sections": {
          "basics": {
            "title": "Basics",
            "questions": {
              "favorite-color": {
                "title": "Favorite color",
                "type": "single-choice",
                "content": {
                  "blue": "Blue"
                }
              }
            }
          }
        }
      }
      """
    And the survey HTML template is:
      """
      {{> root}}
      """
    And the saver CGI template is:
      """
      #!/usr/local/bin/node --experimental-specifier-resolution=node
      export const kind = "save";
      """
    And the reporter CGI template is:
      """
      #!/usr/local/bin/node --experimental-specifier-resolution=node
      export const kind = "report";
      """
    And the generated survey deployment settings are:
      """
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
      }
      """
    And the target node executable is:
      """
      /usr/bin/node
      """
    When the survey deployment artifacts are built
    Then the generated public artifact paths are:
      """
      [index.html, ok.html, fail.html]
      """
    And the generated CGI artifact paths are:
      """
      [save.cgi, report.cgi]
      """
    And the generated private artifact paths are:
      """
      [survey.json]
      """
    And the generated public artifacts contain:
      """
      {
        "index.html": [
          "action=\"https://example.test/cgi-bin/basic/save.cgi?ok=https%3A%2F%2Fexample.test%2Fbasic%2Fok.html&fail=https%3A%2F%2Fexample.test%2Fbasic%2Ffail.html\"",
          "<title>Example survey</title>"
        ],
        "ok.html": [
          "Survey saved",
          "Your answers have been stored."
        ],
        "fail.html": [
          "Survey save failed",
          "Your answers could not be stored."
        ]
      }
      """
    And the generated CGI artifacts contain:
      """
      {
        "save.cgi": [
          'var kind = "save"'
        ],
        "report.cgi": [
          'var kind = "report"'
        ]
      }
      """
    And all generated CGI artifacts start with the target node executable
    And the generated private artifact "survey.json" is:
      """
      {"title":"Example survey","sections":{"basics":{"title":"Basics","questions":{"favorite-color":{"title":"Favorite color","type":"single-choice","content":{"blue":"Blue"}}}}}}
      """
