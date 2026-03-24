Feature: Nuke generated workspace artifacts and dependencies
  Scenario: Generated build directories and node_modules are removed
    Given an isolated workspace has generated build artifacts and installed dependencies
    When I run "npm --silent run nuke" in the isolated workspace
    Then the command output is empty
    And the isolated workspace generated build artifacts are removed
