Feature: Parse deployment target configuration
  Scenario: An SSH target accepts shared fields and defaults optional settings
    Given the target directory name is "example-vps"
    And the target configuration JSON is:
      """
      {
        "type": "ssh",
        "sshTarget": "deploy@example.test",
        "publicPath": "~/sites/example.test/www/./surveys",
        "cgiPath": "~/sites/example.test/www/./cgi-bin",
        "dataDir": "~/sites/example.test/www/./data",
        "publicBaseUrl": "https://example.test",
        "saverUrl": "https://example.test/cgi-bin/save-survey.js",
        "reporterUrl": "https://example.test/cgi-bin/report-survey.js"
      }
      """
    When the deployment target configuration is parsed
    Then the parsed target name is "example-vps"
    And the parsed target type is "ssh"
    And the parsed SSH target is "deploy@example.test"
    And the parsed container name is empty
    And the parsed public path is "~/sites/example.test/www/./surveys"
    And the parsed CGI path is "~/sites/example.test/www/./cgi-bin"
    And the parsed data directory is "~/sites/example.test/www/./data"
    And the parsed protection file is "~/sites/example.test/www/./data/protection.txt"
    And the parsed create-missing-subpaths setting is true

  Scenario: A container target accepts a custom protection file and creation flag
    Given the target directory name is "local-container"
    And the target configuration JSON is:
      """
      {
        "type": "container",
        "containerName": "associative-survey-local",
        "publicPath": "/srv/www/./surveys",
        "cgiPath": "/srv/www/./cgi-bin",
        "dataDir": "/srv/data/./surveys",
        "protectionFile": "/srv/data/./secrets/reporter-protection.txt",
        "publicBaseUrl": "http://127.0.0.1:18080",
        "saverUrl": "http://127.0.0.1:18080/cgi-bin/save-survey.js",
        "reporterUrl": "http://127.0.0.1:18080/cgi-bin/report-survey.js",
        "createMissingSubpaths": false
      }
      """
    When the deployment target configuration is parsed
    Then the parsed target name is "local-container"
    And the parsed target type is "container"
    And the parsed SSH target is empty
    And the parsed container name is "associative-survey-local"
    And the parsed protection file is "/srv/data/./secrets/reporter-protection.txt"
    And the parsed create-missing-subpaths setting is false

  Scenario: An SSH target requires an SSH address
    Given the target directory name is "example-vps"
    And the target configuration JSON is:
      """
      {
        "type": "ssh",
        "publicPath": "~/sites/example.test/www/./surveys",
        "cgiPath": "~/sites/example.test/www/./cgi-bin",
        "dataDir": "~/sites/example.test/www/./data",
        "publicBaseUrl": "https://example.test",
        "saverUrl": "https://example.test/cgi-bin/save-survey.js",
        "reporterUrl": "https://example.test/cgi-bin/report-survey.js"
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
        "publicPath": "/srv/www/./surveys",
        "cgiPath": "/srv/www/./cgi-bin",
        "dataDir": "/srv/data/./surveys",
        "publicBaseUrl": "http://127.0.0.1:18080",
        "saverUrl": "http://127.0.0.1:18080/cgi-bin/save-survey.js",
        "reporterUrl": "http://127.0.0.1:18080/cgi-bin/report-survey.js"
      }
      """
    When the deployment target configuration is parsed
    Then the deployment target configuration is rejected with "Container targets must define containerName"
