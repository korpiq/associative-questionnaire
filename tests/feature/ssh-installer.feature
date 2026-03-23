Feature: Build an SSH install plan from a target configuration
  Scenario: An SSH target produces tarball deployment commands from configured paths
    Given the loaded SSH deployment target is:
      """
      {
        "targetName": "example-vps",
        "type": "ssh",
        "sshTarget": "deploy@example.test",
        "publicDir": "sites/example.test/www/surveys",
        "cgiDir": "sites/example.test/www/cgi-bin",
        "dataDir": "sites/example.test/www/data",
        "baseUrl": "https://example.test",
        "staticUriPath": "/surveys",
        "cgiUriPath": "/cgi-bin",
        "nodeExecutable": "/usr/local/bin/node",
        "cgiExtension": ".cgi",
        "targetDirectory": "/workspace/targets/example-vps",
        "surveys": [
          {
            "surveyName": "survey",
            "surveyDirectory": "/workspace/targets/example-vps/surveys/survey",
            "surveyPath": "/workspace/targets/example-vps/surveys/survey/survey.json",
            "templatePath": "/workspace/targets/example-vps/surveys/survey/template.html"
          }
        ]
      }
      """
    When the SSH install plan is built
    Then the remote public root is "sites/example.test/www/surveys"
    And the remote CGI root is "sites/example.test/www/cgi-bin"
    And the remote data root is "sites/example.test/www/data"
    And the remote SSH staging root is "$HOME/.cache/associative-survey-deploy/example-vps"
    And the local SSH deployment tarball is "deploy/generated/example-vps.tar.gz"
    And the SSH install commands are:
      """
      [
        [
          "ssh",
          "deploy@example.test",
          "mkdir -p \"$HOME/.cache/associative-survey-deploy/example-vps\""
        ],
        [
          "scp",
          "deploy/generated/example-vps.tar.gz",
          "deploy@example.test:~/.cache/associative-survey-deploy/example-vps/example-vps.tar.gz"
        ],
        [
          "ssh",
          "deploy@example.test",
          "tar -xzf \"$HOME/.cache/associative-survey-deploy/example-vps/example-vps.tar.gz\" -C \"$HOME/.cache/associative-survey-deploy/example-vps\" && \"$HOME/.cache/associative-survey-deploy/example-vps/setup.sh\" \"$HOME/.cache/associative-survey-deploy/example-vps/example-vps.tar.gz\""
        ]
      ]
      """

  Scenario: A non-SSH target is rejected
    Given the loaded SSH deployment target is:
      """
      {
        "targetName": "local-container",
        "type": "container",
        "containerName": "associative-survey-local",
        "publicDir": "/srv/www/surveys",
        "cgiDir": "/srv/www/cgi-bin",
        "dataDir": "/home/app/.local/share/associative-survey",
        "baseUrl": "http://127.0.0.1",
        "port": 18080,
        "staticUriPath": "/surveys",
        "cgiUriPath": "/cgi-bin",
        "nodeExecutable": "/usr/local/bin/node",
        "cgiExtension": ".cgi",
        "targetDirectory": "/workspace/targets/local-container",
        "surveys": []
      }
      """
    When the SSH install plan is built
    Then the SSH install plan is rejected with "SSH install plans require an ssh target configuration"
