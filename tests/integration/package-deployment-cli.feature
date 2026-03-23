Feature: Package deployment artifacts through path-based CLIs
  Scenario: Packaging a target path includes every survey in that target
    Given an isolated workspace target for deployment packaging CLI coverage
    And the isolated workspace target has a container deployment target with two surveys
    When I package the target path through the CLI
    Then the package CLI output selects surveys:
      """
      [alpha, beta]
      """
    And the package CLI tarball exists

  Scenario: Packaging a survey path includes only that survey
    Given an isolated workspace target for deployment packaging CLI coverage
    And the isolated workspace target has a container deployment target with two surveys
    When I package the survey path through the CLI
    Then the package CLI output selects surveys:
      """
      [beta]
      """
    And the package CLI tarball exists
