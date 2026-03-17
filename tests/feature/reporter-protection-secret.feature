Feature: Prepare deploy-time reporter protection secrets
  Scenario: A deploy helper injects the reporter protection secret into a script template and stores it locally
    Given an empty deployment workspace directory
    And the reporter script template is:
      """
      const REPORTER_PROTECTION_SECRET = "__REPORTER_PROTECTION_SECRET__";
      export { REPORTER_PROTECTION_SECRET };
      """
    When the reporter protection secret is prepared
    Then the prepared reporter script omits "__REPORTER_PROTECTION_SECRET__"
    And the prepared reporter script contains:
      """
      const REPORTER_PROTECTION_SECRET = "
      """
    And the stored reporter protection secret file path is ".deploy/reporter-protection-secret.txt"
    And the stored reporter protection secret matches the injected reporter protection secret
