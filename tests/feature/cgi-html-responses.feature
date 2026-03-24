Feature: Render saver CGI redirect responses
  Scenario: Success redirect sets the respondent cookie
    Given a successful saver outcome
    And the saver response parameters are:
      """
      {
        ok: "https://example.test/thanks.html",
        setCookieHeader: "associativeSurveyRespondentId=0123456789abcdef0123456789abcdef; Max-Age=2592000; Path=/; HttpOnly; SameSite=Lax"
      }
      """
    When the saver CGI response is rendered
    Then the CGI response status code is 303
    And the CGI response header "Location" is "https://example.test/thanks.html"
    And the CGI response header "Set-Cookie" is "associativeSurveyRespondentId=0123456789abcdef0123456789abcdef; Max-Age=2592000; Path=/; HttpOnly; SameSite=Lax"
    And the CGI response body is empty

  Scenario: Success redirect
    Given a successful saver outcome
    And the saver response parameters are:
      """
      {
        ok: "https://example.test/thanks.html"
      }
      """
    When the saver CGI response is rendered
    Then the CGI response status code is 303
    And the CGI response header "Location" is "https://example.test/thanks.html"
    And the CGI response body is empty

  Scenario: Failure redirect
    Given a failed saver outcome with message "Survey save failed"
    And the saver response parameters are:
      """
      {
        fail: "https://example.test/error.html"
      }
      """
    When the saver CGI response is rendered
    Then the CGI response status code is 303
    And the CGI response header "Location" is "https://example.test/error.html"
    And the CGI response body is empty

  Scenario: Missing success redirect is rejected
    Given a successful saver outcome
    When the saver CGI response is rendered
    Then rendering the saver CGI response is rejected with "Successful saver responses must include ok"

  Scenario: Missing failure redirect is rejected
    Given a failed saver outcome with message "Survey save failed"
    When the saver CGI response is rendered
    Then rendering the saver CGI response is rejected with "Failed saver responses must include fail"
