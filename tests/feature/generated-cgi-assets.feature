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

  Scenario: A reporter CGI asset injects runtime data directories and the protection secret
    Given an empty deployment workspace directory
    And the reporter CGI template is:
      """
      const SURVEYS_DATA_DIR = "__SURVEYS_DATA_DIR__";
      const ANSWERS_DATA_DIR = "__ANSWERS_DATA_DIR__";
      const PROTECTION_FILE = "__PROTECTION_FILE__";
      const REPORTER_PROTECTION_SECRET = "__REPORTER_PROTECTION_SECRET__";
      export { SURVEYS_DATA_DIR, ANSWERS_DATA_DIR, PROTECTION_FILE, REPORTER_PROTECTION_SECRET };
      """
    And the reporter CGI settings are:
      """
      {
        "surveysDataDir": "/srv/sites/example.test/www/./data/surveys",
        "answersDataDir": "/srv/sites/example.test/www/./data/answers",
        "protectionFile": "/srv/sites/example.test/www/./data/reporter-protection.txt"
      }
      """
    When the reporter CGI asset is prepared
    Then the prepared reporter CGI asset omits:
      """
      [
        "__SURVEYS_DATA_DIR__",
        "__ANSWERS_DATA_DIR__",
        "__PROTECTION_FILE__",
        "__REPORTER_PROTECTION_SECRET__"
      ]
      """
    And the prepared reporter CGI asset contains:
      """
      [
        "/srv/sites/example.test/www/./data/surveys",
        "/srv/sites/example.test/www/./data/answers",
        "/srv/sites/example.test/www/./data/reporter-protection.txt"
      ]
      """
    And the stored reporter protection secret file path is ".deploy/reporter-protection-secret.txt"
    And the stored reporter protection secret matches the injected reporter protection secret
