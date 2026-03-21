Feature: Container Dockerfile uses the deployable tarball
  Scenario: The runtime image copies only the prepared container tarball
    When the container Dockerfile is inspected
    Then the Dockerfile copy instructions are:
      """
      [COPY deploy/generated/container-image.tar.gz /tmp/deployable-container.tar.gz]
      """
    And the Dockerfile extracts and removes the deployable tarball
