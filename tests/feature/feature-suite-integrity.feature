Feature: Feature suite integrity
  Scenario: Every tracked feature file is loaded by a feature spec
    When the tracked feature files and feature specs are inspected
    Then every tracked feature file is loaded by a spec
