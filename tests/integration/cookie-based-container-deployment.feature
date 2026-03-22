Feature: Cookie-based container deployment test flow
  Background:
    Given the cookie-based container test resources are cleaned up
    And I build the project for the cookie-based container deployment test
    And I prepare container assets for the sample target for the cookie-based container deployment test
    And I build the cookie-based sample container image
    And I start the cookie-based sample container
    And I install the prepared sample target into the running cookie-based container

  Scenario: The prepared container image reports zero respondents, saves one cookie-identified response, and reports one respondent
    Given the cookie-based sample survey page contains "Associative survey example"
    And the cookie-based sample report page contains "Respondents: 0"
    When I submit one survey response without cookie through the sample saver CGI
    Then the response sets a cookie
    And the cookie-based saver response contains "Survey saved"
    And the cookie-based sample report page later contains "Respondents: 1"
    When I submit one survey response with the returned cookie through the sample saver CGI
    Then the cookie-based saver response still contains "Survey saved"
    And the cookie-based sample report page still contains "Respondents: 1"
    When I submit another survey response without cookie through the sample saver CGI
    Then the response sets a new cookie
    And the cookie-based saver response again contains "Survey saved"
    And the cookie-based sample report page finally contains "Respondents: 2"
