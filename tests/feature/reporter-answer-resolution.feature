Feature: Resolve stored reporter answers from raw saved submissions
  Scenario: Valid raw stored answer files are normalized during reporter resolution
    Given an empty reporter answer resolution home directory
    And a stored reporter survey named "example-survey" exists
    And a valid raw stored answer file exists for that survey
    When the reporter resolves stored survey data for "example-survey"
    Then the resolved validated answer file count is 1
    And the first resolved validated answer contains question "favorite-color" with value "blue"

  Scenario: Invalid associative raw stored answer files are rejected during reporter resolution
    Given an empty reporter answer resolution home directory
    And a stored reporter survey named "example-survey" exists
    And an invalid associative raw stored answer file exists for that survey
    When the reporter resolves stored survey data for "example-survey"
    Then reporter answer resolution is rejected

  Scenario: Raw stored answers that do not match the survey definition are rejected during reporter resolution
    Given an empty reporter answer resolution home directory
    And a stored reporter survey named "example-survey" exists
    And a mismatched raw stored answer file exists for that survey
    When the reporter resolves stored survey data for "example-survey"
    Then reporter answer resolution is rejected
