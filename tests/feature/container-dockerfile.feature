Feature: Container Dockerfile stays generic
  Scenario: The runtime image does not bake in prepared deployment assets
    When the container Dockerfile is inspected
    Then the Dockerfile copy instructions are:
      """
      []
      """
    And the Dockerfile does not extract a deployable tarball at build time
