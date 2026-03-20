Feature: Resolve CGI runtime paths from the deployed script location
  Scenario: Runtime survey paths are resolved from the CGI script directory
    Given the CGI script filename is:
      """
      /srv/sites/example.test/www/cgi-bin/basic/save.cgi
      """
    And the private survey relative path is:
      """
      ../../data/basic/survey.json
      """
    And the private answers relative path is:
      """
      ../../data/basic/answers
      """
    When the CGI runtime paths are resolved
    Then the resolved CGI runtime paths are:
      """
      {
        scriptFilename: /srv/sites/example.test/www/cgi-bin/basic/save.cgi,
        scriptDirectory: /srv/sites/example.test/www/cgi-bin/basic,
        surveyName: basic,
        privateSurveyPath: /srv/sites/example.test/www/data/basic/survey.json,
        privateAnswersDir: /srv/sites/example.test/www/data/basic/answers
      }
      """

  Scenario: Missing CGI script filename is rejected
    Given the CGI script filename is:
      """

      """
    And the private survey relative path is:
      """
      ../../data/basic/survey.json
      """
    And the private answers relative path is:
      """
      ../../data/basic/answers
      """
    When the CGI runtime paths are resolved
    Then the CGI runtime path resolution fails with:
      """
      Missing SCRIPT_FILENAME
      """
