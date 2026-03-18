Feature: Manage saver respondent cookies
  Scenario: Existing respondent cookie is reused
    Given the CGI cookie header is "associativeSurveyRespondentId=0123456789abcdef0123456789abcdef; theme=light"
    When the saver respondent cookie is resolved
    Then the respondent id is "0123456789abcdef0123456789abcdef"
    And no Set-Cookie header is required

  Scenario: Missing respondent cookie creates a new month-long cookie
    Given no CGI cookie header
    When the saver respondent cookie is resolved
    Then a new respondent id is generated
    And the Set-Cookie header contains "associativeSurveyRespondentId="
    And the Set-Cookie header contains "Max-Age=2592000"
    And the Set-Cookie header contains "Path=/"
    And the Set-Cookie header contains "HttpOnly"
    And the Set-Cookie header contains "SameSite=Lax"
