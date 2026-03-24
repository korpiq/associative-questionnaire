Feature: Build v3 deployment package file trees

  Scenario: Absolute target paths write files under files/root
    Given an isolated workspace for v3 deployment package building
    And the isolated workspace has a container target with absolute paths and one survey
    When I build the deployment package for that target
    Then the deployment package has a public survey file under files/root
    And the deployment package has a CGI survey file under files/root
    And the deployment package has a private survey file under files/root

  Scenario: Relative target paths write files under files/home
    Given an isolated workspace for v3 deployment package building
    And the isolated workspace has an SSH target with relative paths and one survey
    When I build the deployment package for that target
    Then the deployment package has a public survey file under files/home
    And the deployment package has a CGI survey file under files/home
    And the deployment package has a private survey file under files/home

  Scenario: SSH and container targets produce identical local file lists for the same paths
    Given an isolated workspace for v3 deployment package building
    And the isolated workspace has an SSH target with relative paths and one survey
    When I build the deployment package for that target
    And I also build the deployment package for a container target with identical paths and the same survey
    Then both deployment packages contain the same relative file paths under files/
