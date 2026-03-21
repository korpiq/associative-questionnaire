Feature: Cookie-based container deployment test flow
  Scenario: The prepared container image reports zero respondents, saves one cookie-identified response, and reports one respondent
    Given the cookie-based container test resources are cleaned up
    When I build the project for the cookie-based container deployment test
    And I prepare container assets for the sample target for the cookie-based container deployment test
    And I build the cookie-based sample container image
    And I start the cookie-based sample container
    Then the cookie-based sample survey page contains "Associative survey example"
    And the cookie-based sample report page contains "Respondents: 0"
    When I submit one cookie-identified survey response through the sample saver CGI
    Then the cookie-based saver response contains "Survey saved"
    And the cookie-based sample report page later contains "Respondents: 1"
