Feature: Build an SSH install plan from a target configuration
  Scenario: An SSH target produces remote copy commands from configured paths
    Given the loaded SSH deployment target is:
      """
      {
        "targetName": "example-vps",
        "type": "ssh",
        "sshTarget": "deploy@example.test",
        "publicPath": "~/sites/example.test/www/./surveys",
        "cgiPath": "~/sites/example.test/www/./cgi-bin",
        "dataDir": "~/sites/example.test/www/./data",
        "protectionFile": "~/sites/example.test/www/./data/protection.txt",
        "publicBaseUrl": "https://example.test",
        "saverUrl": "https://example.test/cgi-bin/save-survey.js",
        "reporterUrl": "https://example.test/cgi-bin/report-survey.js",
        "createMissingSubpaths": true,
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
    And the local reporter protection secret file path is "/workspace/.deploy/reporter-protection-secret.txt"
    When the SSH install plan is built
    Then the remote public root is "$HOME/sites/example.test/www/surveys"
    And the remote CGI root is "$HOME/sites/example.test/www/cgi-bin"
    And the remote data root is "$HOME/sites/example.test/www/data"
    And the remote protection file path is "$HOME/sites/example.test/www/data/protection.txt"
    And the SSH install commands are:
      """
      [
        [
          "ssh",
          "deploy@example.test",
          "test -d \"$HOME/sites/example.test/www\" && test -d \"$HOME/sites/example.test/www\" && test -d \"$HOME/sites/example.test/www\" && mkdir -p \"$HOME/sites/example.test/www/surveys\" \"$HOME/sites/example.test/www/cgi-bin\" \"$HOME/sites/example.test/www/data\" \"$HOME/sites/example.test/www/data/surveys\" \"$HOME/sites/example.test/www/data/answers\""
        ],
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
          "scp",
          "/workspace/.deploy/reporter-protection-secret.txt",
          "deploy@example.test:$HOME/sites/example.test/www/data/protection.txt"
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
        "publicPath": "/srv/www/./surveys",
        "cgiPath": "/srv/www/./cgi-bin",
        "dataDir": "/home/app/.local/share/associative-survey",
        "protectionFile": "/home/app/.local/share/associative-survey/protection.txt",
        "publicBaseUrl": "http://127.0.0.1:18080",
        "saverUrl": "http://127.0.0.1:18080/cgi-bin/save-survey.js",
        "reporterUrl": "http://127.0.0.1:18080/cgi-bin/report-survey.js",
        "createMissingSubpaths": true,
        "targetDirectory": "/workspace/targets/local-container",
        "surveys": []
      }
      """
    And the local reporter protection secret file path is "/workspace/.deploy/reporter-protection-secret.txt"
    When the SSH install plan is built
    Then the SSH install plan is rejected with "SSH install plans require an ssh target configuration"
