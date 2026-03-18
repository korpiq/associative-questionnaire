Feature: Render saver CGI HTML responses
  Scenario: Built-in success page
    Given a successful saver outcome
    When the saver CGI response is rendered
    Then the CGI response status code is 200
    And the CGI response content type is "text/html; charset=utf-8"
    And the CGI response body contains "Survey saved"
    And the CGI response body contains "Your answers have been stored."

  Scenario: Success response sets the respondent cookie
    Given a successful saver outcome
    And the saver response parameters are:
      """
      {
        setCookieHeader: "associativeSurveyRespondentId=0123456789abcdef0123456789abcdef; Max-Age=2592000; Path=/; HttpOnly; SameSite=Lax"
      }
      """
    When the saver CGI response is rendered
    Then the CGI response status code is 200
    And the CGI response header "Set-Cookie" is "associativeSurveyRespondentId=0123456789abcdef0123456789abcdef; Max-Age=2592000; Path=/; HttpOnly; SameSite=Lax"

  Scenario: Built-in failure page
    Given a failed saver outcome with message "Survey save failed"
    When the saver CGI response is rendered
    Then the CGI response status code is 400
    And the CGI response content type is "text/html; charset=utf-8"
    And the CGI response body contains "Survey save failed"

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
    And the CGI response body contains "Redirecting"

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
    And the CGI response body contains "Redirecting"

  Scenario: Built-in page with custom stylesheet
    Given a successful saver outcome
    And the saver response parameters are:
      """
      {
        css: "https://example.test/saver.css"
      }
      """
    When the saver CGI response is rendered
    Then the CGI response status code is 200
    And the CGI response body contains:
      """
      <link rel="stylesheet" href="https://example.test/saver.css">
      """
