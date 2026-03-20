Feature: Parse deployment target configuration
  Scenario: An SSH target accepts the v2 target.json fields
    Given the target directory name is "example-vps"
    And the target configuration JSON is:
      """
      {
        "type": "ssh",
        "sshTarget": "deploy@example.test",
        "publicDir": "~/sites/example.test/www/surveys",
        "cgiDir": "~/sites/example.test/www/cgi-bin",
        "dataDir": "~/sites/example.test/www/data",
        "publicBaseUrl": "https://example.test/surveys",
        "cgiBaseUrl": "https://example.test/cgi-bin",
        "nodeExecutable": "/usr/local/bin/node",
        "cgiExtension": ".cgi"
      }
      """
    When the deployment target configuration is parsed
    Then the parsed target configuration is:
      """
      {
        "targetName": "example-vps",
        "type": "ssh",
        "sshTarget": "deploy@example.test",
        "publicDir": "~/sites/example.test/www/surveys",
        "cgiDir": "~/sites/example.test/www/cgi-bin",
        "dataDir": "~/sites/example.test/www/data",
        "publicBaseUrl": "https://example.test/surveys",
        "cgiBaseUrl": "https://example.test/cgi-bin",
        "nodeExecutable": "/usr/local/bin/node",
        "cgiExtension": ".cgi"
      }
      """

  Scenario: A container target accepts the v2 target.json fields
    Given the target directory name is "local-container"
    And the target configuration JSON is:
      """
      {
        "type": "container",
        "containerName": "associative-survey-local",
        "publicDir": "/srv/www/surveys",
        "cgiDir": "/srv/www/cgi-bin",
        "dataDir": "/srv/data/surveys",
        "publicBaseUrl": "http://127.0.0.1:18080/surveys",
        "cgiBaseUrl": "http://127.0.0.1:18080/cgi-bin",
        "nodeExecutable": "/usr/local/bin/node",
        "cgiExtension": ".cgi"
      }
      """
    When the deployment target configuration is parsed
    Then the parsed target configuration is:
      """
      {
        "targetName": "local-container",
        "type": "container",
        "containerName": "associative-survey-local",
        "publicDir": "/srv/www/surveys",
        "cgiDir": "/srv/www/cgi-bin",
        "dataDir": "/srv/data/surveys",
        "publicBaseUrl": "http://127.0.0.1:18080/surveys",
        "cgiBaseUrl": "http://127.0.0.1:18080/cgi-bin",
        "nodeExecutable": "/usr/local/bin/node",
        "cgiExtension": ".cgi"
      }
      """

  Scenario: An SSH target requires an SSH address
    Given the target directory name is "example-vps"
    And the target configuration JSON is:
      """
      {
        "type": "ssh",
        "publicDir": "~/sites/example.test/www/surveys",
        "cgiDir": "~/sites/example.test/www/cgi-bin",
        "dataDir": "~/sites/example.test/www/data",
        "publicBaseUrl": "https://example.test/surveys",
        "cgiBaseUrl": "https://example.test/cgi-bin",
        "nodeExecutable": "/usr/local/bin/node",
        "cgiExtension": ".cgi"
      }
      """
    When the deployment target configuration is parsed
    Then the deployment target configuration is rejected with "SSH targets must define sshTarget"

  Scenario: A container target requires a container name
    Given the target directory name is "local-container"
    And the target configuration JSON is:
      """
      {
        "type": "container",
        "publicDir": "/srv/www/surveys",
        "cgiDir": "/srv/www/cgi-bin",
        "dataDir": "/srv/data/surveys",
        "publicBaseUrl": "http://127.0.0.1:18080/surveys",
        "cgiBaseUrl": "http://127.0.0.1:18080/cgi-bin",
        "nodeExecutable": "/usr/local/bin/node",
        "cgiExtension": ".cgi"
      }
      """
    When the deployment target configuration is parsed
    Then the deployment target configuration is rejected with "Container targets must define containerName"
