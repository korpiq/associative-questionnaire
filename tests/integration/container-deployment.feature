Feature: Container deployment test flow
  Scenario: The prepared container image serves the sample survey and stores one response
    Given the sample container test resources are cleaned up
    When I build the project for the container deployment test
    And I prepare container assets for the sample target
    And I build the sample container image
    And I start the sample container
    Then the sample survey page contains "Submit survey"
    When I submit one survey response through the sample saver CGI
    Then the saver response contains "Survey saved"
    And the sample report page contains "Respondents: 1"
