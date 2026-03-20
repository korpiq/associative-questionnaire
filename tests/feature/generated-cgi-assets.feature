Feature: Prepare target-based CGI assets
  Scenario: A saver CGI asset injects per-survey private data paths
    Given the saver CGI template is:
      """
      const PRIVATE_SURVEY_PATH = "__PRIVATE_SURVEY_PATH__";
      const PRIVATE_ANSWERS_DIR = "__PRIVATE_ANSWERS_DIR__";
      export { PRIVATE_SURVEY_PATH, PRIVATE_ANSWERS_DIR };
      """
    And the saver CGI settings are:
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
    When the saver CGI asset is prepared
    Then the prepared saver CGI asset omits:
      """
      [
        "__PRIVATE_SURVEY_PATH__",
        "__PRIVATE_ANSWERS_DIR__"
      ]
      """
    And the prepared saver CGI asset contains:
      """
      [
        "/srv/sites/example.test/www/data/basic/survey.json",
        "/srv/sites/example.test/www/data/basic/answers"
      ]
      """

  Scenario: A reporter CGI asset injects survey name and per-survey private data paths
    Given the reporter CGI template is:
      """
      const SURVEY_NAME = "__SURVEY_NAME__";
      const PRIVATE_SURVEY_PATH = "__PRIVATE_SURVEY_PATH__";
      const PRIVATE_ANSWERS_DIR = "__PRIVATE_ANSWERS_DIR__";
      export { SURVEY_NAME, PRIVATE_SURVEY_PATH, PRIVATE_ANSWERS_DIR };
      """
    And the reporter CGI settings are:
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
    When the reporter CGI asset is prepared
    Then the prepared reporter CGI asset omits:
      """
      [
        "__SURVEY_NAME__",
        "__PRIVATE_SURVEY_PATH__",
        "__PRIVATE_ANSWERS_DIR__"
      ]
      """
    And the prepared reporter CGI asset contains:
      """
      [
        "basic",
        "/srv/sites/example.test/www/data/basic/survey.json",
        "/srv/sites/example.test/www/data/basic/answers"
      ]
      """
