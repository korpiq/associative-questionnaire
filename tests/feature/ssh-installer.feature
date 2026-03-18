Feature: Build an SSH install plan for VPS deployment
  Scenario: A valid install path produces remote copy commands under the remote home directory
    Given the SSH target is "deploy@example.test"
    And the remote install path is "sites/associative-survey"
    When the SSH install plan is built
    Then the remote public root is "$HOME/sites/associative-survey/public"
    And the remote runtime root is "$HOME/.local/share/associative-survey"
    And the SSH install commands are:
      """
      [
        [
          ssh,
          deploy@example.test,
          "mkdir -p '$HOME/sites/associative-survey/public/cgi-bin' '$HOME/sites/associative-survey/public/surveys' '$HOME/.local/share/associative-survey/surveys' '$HOME/.local/share/associative-survey/answers'"
        ],
        [
          scp,
          -r,
          deploy/generated/public/.,
          deploy@example.test:$HOME/sites/associative-survey/public/
        ],
        [
          scp,
          -r,
          deploy/generated/runtime/surveys/.,
          deploy@example.test:$HOME/.local/share/associative-survey/surveys/
        ],
        [
          ssh,
          deploy@example.test,
          "chmod 755 '$HOME/sites/associative-survey/public/cgi-bin'/*.js"
        ]
      ]
      """

  Scenario: An absolute remote install path is rejected
    Given the SSH target is "deploy@example.test"
    And the remote install path is "/var/www/associative-survey"
    When the SSH install plan is built
    Then the SSH install plan is rejected with "Install path must be relative to the remote home directory"
