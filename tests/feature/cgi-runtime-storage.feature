Feature: Create saver runtime storage under the effective user home directory
  Scenario: The answers root and survey directory are created on demand
    Given an empty effective user home directory
    And the survey name is "example-survey"
    When the saver runtime storage is ensured
    Then the runtime answers root exists under the effective user home directory
    And the survey answers directory exists
