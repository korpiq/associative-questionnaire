Feature: Persist raw saved survey submissions through the shared saver path
  Scenario: A survey submission is written into the survey answers directory
    Given an empty saver home directory
    And the survey name is "example-survey"
    And the URL-encoded request body is:
      """
      favorite-color=blue&notes=First+note
      """
    And the respondent id is "0123456789abcdef0123456789abcdef"
    When the survey submission is saved
    Then one saved answer file exists for the survey
    And the saved answer file contains:
      """
      {
        requestBody: favorite-color=blue&notes=First+note
      }
      """

  Scenario: Saving again for the same respondent replaces the existing survey answer file
    Given an empty saver home directory
    And the survey name is "example-survey"
    And the first URL-encoded request body is:
      """
      favorite-color=red&notes=First+note
      """
    And the replacement URL-encoded request body is:
      """
      favorite-color=blue&notes=Updated+note
      """
    And the respondent id is "0123456789abcdef0123456789abcdef"
    When the first survey submission is saved
    And the replacement survey submission is saved
    Then one saved answer file exists for the survey
    And the saved answer file contains:
      """
      {
        requestBody: favorite-color=blue&notes=Updated+note
      }
      """
