Feature: Parse deployment paths as plain paths
  Scenario: A path containing /./ is treated as a plain path
    Given the configured deployment path is "~/sites/example.test/www/./surveys/forms"
    When the deployment path is parsed
    Then the parsed existing root is "~/sites/example.test/www/./surveys/forms"
    And the parsed createable subpath is empty
    And the parsed full deployment path is "~/sites/example.test/www/./surveys/forms"

  Scenario: A path without /./ is also treated as a plain path
    Given the configured deployment path is "~/sites/example.test/www"
    When the deployment path is parsed
    Then the parsed existing root is "~/sites/example.test/www"
    And the parsed createable subpath is empty
    And the parsed full deployment path is "~/sites/example.test/www"
