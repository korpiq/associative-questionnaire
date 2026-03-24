Feature: Clean generated workspace artifacts
  Scenario: Generated build directories are removed
    Given the workspace has generated build artifacts
    When I run "npm --silent run clean"
    Then the command output is empty
    And the generated build artifacts are removed
