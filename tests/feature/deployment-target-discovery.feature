Feature: Load deployment targets from the workspace
  Scenario: A target is loaded from targets/<target-name>/target.json and discovers its surveys
    Given an empty deployment workspace
    And the target directory name is "example-vps"
    And the target configuration file contains:
      """
      {
        "type": "ssh",
        "sshTarget": "deploy@example.test",
        "publicDir": "~/sites/example.test/www/surveys",
        "cgiDir": "~/sites/example.test/www/cgi-bin",
        "dataDir": "~/sites/example.test/www/data",
        "baseUrl": "https://example.test",
        "staticUriPath": "/surveys",
        "cgiUriPath": "/cgi-bin",
        "nodeExecutable": "/usr/local/bin/node",
        "cgiExtension": ".cgi"
      }
      """
    And the target has survey directories:
      """
      [
        "basic",
        "follow-up"
      ]
      """
    When the deployment target is loaded from the workspace
    Then the loaded target name is "example-vps"
    And the loaded survey names are:
      """
      [
        "basic",
        "follow-up"
      ]
      """
    And the loaded survey file paths are:
      """
      [
        "targets/example-vps/surveys/basic/survey.json",
        "targets/example-vps/surveys/follow-up/survey.json"
      ]
      """
    And the loaded template file paths are:
      """
      [
        "targets/example-vps/surveys/basic/template.html",
        "targets/example-vps/surveys/follow-up/template.html"
      ]
      """

  Scenario: A target without target.json is rejected
    Given an empty deployment workspace
    And the target directory name is "missing-target"
    When the deployment target is loaded from the workspace
    Then loading the deployment target is rejected with "Deployment target configuration file was not found: targets/missing-target/target.json"
