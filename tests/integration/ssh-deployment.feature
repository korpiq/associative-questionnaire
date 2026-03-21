Feature: SSH deployment test flow
  Scenario: A survey is deployed over SSH and works from the remote host
    Given the SSH deployment test resources are cleaned up
    And the SSH deployment test workspace and target are prepared
    And the SSH deployment test host container image is prepared
    When I start the SSH deployment test host container
    And I install the SSH deployment target through the CLI
    Then the deployed SSH survey page contains "Associative survey example"
    When I submit one survey response through the deployed SSH saver CGI
    Then the deployed SSH saver response contains "Survey saved"
    And the deployed SSH report page contains "Respondents: 1"
    And the deployed SSH host has the public survey file
    And the deployed SSH host has the saver CGI file
    And the deployed SSH host has the private survey file
