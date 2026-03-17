Feature: Render saver CGI HTML responses
  Scenario: Successful submissions use the built-in success page by default
    Given a successful saver outcome
    When the saver CGI response is rendered
    Then the CGI response status code is 200
    And the CGI response content type is "text/html; charset=utf-8"
    And the CGI response body contains "Survey saved"
    And the CGI response body contains "Your answers have been stored."

  Scenario: Failed submissions use the built-in failure page by default
    Given a failed saver outcome with message "Survey save failed"
    When the saver CGI response is rendered
    Then the CGI response status code is 400
    And the CGI response content type is "text/html; charset=utf-8"
    And the CGI response body contains "Survey save failed"

  Scenario: Successful submissions can redirect to a custom success page
    Given a successful saver outcome
    And the saver response parameters are:
      """
      {ok: "https://example.test/thanks.html"}
      """
    When the saver CGI response is rendered
    Then the CGI response status code is 303
    And the CGI response header "Location" is "https://example.test/thanks.html"
    And the CGI response body contains "Redirecting"

  Scenario: Failed submissions can redirect to a custom failure page
    Given a failed saver outcome with message "Survey save failed"
    And the saver response parameters are:
      """
      {fail: "https://example.test/error.html"}
      """
    When the saver CGI response is rendered
    Then the CGI response status code is 303
    And the CGI response header "Location" is "https://example.test/error.html"
    And the CGI response body contains "Redirecting"

  Scenario: Built-in pages can link a custom stylesheet
    Given a successful saver outcome
    And the saver response parameters are:
      """
      {css: "https://example.test/saver.css"}
      """
    When the saver CGI response is rendered
    Then the CGI response status code is 200
    And the CGI response body contains:
      """
      <link rel="stylesheet" href="https://example.test/saver.css">
      """
