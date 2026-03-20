Feature: Prepare target-based CGI assets
  Scenario: A saver CGI asset injects the configured runtime data directories
    Given the saver CGI template is:
      """
      const SURVEYS_DATA_DIR = "__SURVEYS_DATA_DIR__";
      const ANSWERS_DATA_DIR = "__ANSWERS_DATA_DIR__";
      export { SURVEYS_DATA_DIR, ANSWERS_DATA_DIR };
      """
    And the saver CGI settings are:
      """
      {
        "surveysDataDir": "/srv/sites/example.test/www/./data/surveys",
        "answersDataDir": "/srv/sites/example.test/www/./data/answers"
      }
      """
    When the saver CGI asset is prepared
    Then the prepared saver CGI asset omits:
      """
      [
        "__SURVEYS_DATA_DIR__",
        "__ANSWERS_DATA_DIR__"
      ]
      """
    And the prepared saver CGI asset contains:
      """
      [
        "/srv/sites/example.test/www/./data/surveys",
        "/srv/sites/example.test/www/./data/answers"
      ]
      """

  Scenario: A reporter CGI asset injects runtime data directories only
    Given the reporter CGI template is:
      """
      const SURVEYS_DATA_DIR = "__SURVEYS_DATA_DIR__";
      const ANSWERS_DATA_DIR = "__ANSWERS_DATA_DIR__";
      export { SURVEYS_DATA_DIR, ANSWERS_DATA_DIR };
      """
    And the reporter CGI settings are:
      """
      {
        "surveysDataDir": "/srv/sites/example.test/www/./data/surveys",
        "answersDataDir": "/srv/sites/example.test/www/./data/answers"
      }
      """
    When the reporter CGI asset is prepared
    Then the prepared reporter CGI asset omits:
      """
      [
        "__SURVEYS_DATA_DIR__",
        "__ANSWERS_DATA_DIR__"
      ]
      """
    And the prepared reporter CGI asset contains:
      """
      [
        "/srv/sites/example.test/www/./data/surveys",
        "/srv/sites/example.test/www/./data/answers"
      ]
      """
