Feature: Build an SSH install plan from a target configuration
  Scenario: An SSH target produces remote copy commands from configured paths
    Given the loaded SSH deployment target is:
      """
      {
        "targetName": "example-vps",
        "type": "ssh",
        "sshTarget": "deploy@example.test",
        "publicDir": "~/sites/example.test/www/surveys",
        "cgiDir": "~/sites/example.test/www/cgi-bin",
        "dataDir": "~/sites/example.test/www/data",
        "publicBaseUrl": "https://example.test",
        "cgiBaseUrl": "https://example.test/cgi-bin",
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
    Then the remote public root is "$HOME/sites/example.test/www/surveys"
    And the remote CGI root is "$HOME/sites/example.test/www/cgi-bin"
    And the remote data root is "$HOME/sites/example.test/www/data"
    And the SSH install commands are:
      """
      [
        [
          "scp",
          "-r",
          "deploy/generated/public/surveys/.",
          "deploy@example.test:$HOME/sites/example.test/www/surveys/"
        ],
        [
          "scp",
          "-r",
          "deploy/generated/public/cgi-bin/.",
          "deploy@example.test:$HOME/sites/example.test/www/cgi-bin/"
        ],
        [
          "scp",
          "-r",
          "deploy/generated/runtime/surveys/.",
          "deploy@example.test:$HOME/sites/example.test/www/data/surveys/"
        ],
        [
          "ssh",
          "deploy@example.test",
          "chmod 755 \"$HOME/sites/example.test/www/cgi-bin\"/*.js"
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
        "publicBaseUrl": "http://127.0.0.1:18080",
        "cgiBaseUrl": "http://127.0.0.1:18080/cgi-bin",
        "nodeExecutable": "/usr/local/bin/node",
        "cgiExtension": ".cgi",
        "targetDirectory": "/workspace/targets/local-container",
        "surveys": []
      }
      """
    When the SSH install plan is built
    Then the SSH install plan is rejected with "SSH install plans require an ssh target configuration"
