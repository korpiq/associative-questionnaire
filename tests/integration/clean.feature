Feature: Clean generated workspace artifacts
  Scenario: Generated build directories are removed
    Given the workspace has generated build artifacts
    When I run "npm --silent run clean"
    Then the command output is:
      """
      Removed generated workspace artifacts: dist deploy/generated
      """
    And the generated build artifacts are removed
    But the tracked deploy templates still exist
