Feature: Prepare generated SSH deployment package
  Scenario: A tarball with canonical per-survey payload files is built
    Given an isolated workspace for generated SSH deployment packages
    And the isolated workspace has an SSH deployment target and one survey
    When the generated SSH deployment package is prepared
    Then the generated SSH deployment tarball exists
    And the generated SSH deployment setup script exists
    And the generated SSH deployment setup script uses the target home-relative directories
    And the generated SSH deployment setup script restores CGI executability
    And the generated SSH deployment tarball contains the canonical per-survey payload files
