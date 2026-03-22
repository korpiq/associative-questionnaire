Feature: Visual test launcher

  Scenario: Visual launcher smoke-checks the showcase container and prints the inspection URLs
    When I run the visual test launcher
    Then the launcher output contains "Visual showcase smoke check passed."
    And the launcher output contains "Survey: http://127.0.0.1:18083/surveys/visual-showcase/"
    And the launcher output contains "Report: http://127.0.0.1:18083/cgi-bin/visual-showcase/report.cgi"
