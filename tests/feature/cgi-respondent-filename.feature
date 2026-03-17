Feature: Derive hashed respondent filenames for saved survey answers
  Scenario: The respondent filename is hashed from request headers
    Given the CGI request headers are:
      """
      {REMOTE_ADDR: 203.0.113.10, HTTP_USER_AGENT: ExampleBrowser/1.0, HTTP_ACCEPT_LANGUAGE: "en-US,en;q=0.9"}
      """
    When the respondent filename is derived
    Then the respondent filename is "c7d0048a499a366862f86eb47b9d840bee2446b2d6baf026002f97caea15ce97.json"

  Scenario: The respondent filename hash can include a deployment salt
    Given the CGI request headers are:
      """
      {REMOTE_ADDR: 203.0.113.10, HTTP_USER_AGENT: ExampleBrowser/1.0, HTTP_ACCEPT_LANGUAGE: "en-US,en;q=0.9"}
      """
    And the deployment salt is "deploy-secret"
    When the respondent filename is derived
    Then the respondent filename is "0ceae74ee1140fb2d162c67b16f18486337d08b5f4b52bbbe20b04abc577a2c5.json"
