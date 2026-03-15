Feature: Questionnaire schema validation
  Scenario: Valid questionnaire content is accepted
    Given valid questionnaire content with supported question types
    When the questionnaire content is parsed with the schema
    Then the questionnaire content is accepted

  Scenario: Invalid associative questionnaire content is rejected
    Given questionnaire content with an associative right-side key that is not a single letter
    When the questionnaire content is parsed with the schema
    Then the questionnaire content is rejected
