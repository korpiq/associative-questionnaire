Feature: Resolve stored reporter answers through the shared schemas
  Scenario: Valid stored answer files are parsed during reporter resolution
    Given an empty reporter answer resolution home directory
    And a stored reporter survey named "example-survey" exists
    And a valid stored answer file exists for that survey
    When the reporter resolves stored survey data for "example-survey"
    Then the resolved validated answer file count is 1
    And the first resolved validated answer contains question "favorite-color" with value "blue"

  Scenario: Invalid stored answer files are rejected during reporter resolution
    Given an empty reporter answer resolution home directory
    And a stored reporter survey named "example-survey" exists
    And an invalid stored answer file exists for that survey
    When the reporter resolves stored survey data for "example-survey"
    Then reporter answer resolution is rejected
