Feature: Prepare generated container layout
  Scenario: Canonical survey artifacts are written under the configured target roots
    Given an isolated workspace for generated container layout
    And the isolated workspace has a container deployment target and one survey
    When the generated container layout is prepared
    Then the generated container layout contains the survey public files
    And the generated container layout contains the survey CGI files
    And the generated container layout contains the survey private files
    And the generated survey page posts to the configured survey CGI URL
    And the generated save CGI file starts with the target node executable
    And the generated save CGI file is executable
    And the generated private survey file contains the survey title
