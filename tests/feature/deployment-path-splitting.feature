Feature: Parse deployment paths with /./ splitting
  Scenario: A path with /./ separates an existing root from a deploy-created subpath
    Given the configured deployment path is "~/sites/example.test/www/./surveys/forms"
    When the deployment path is parsed
    Then the parsed existing root is "~/sites/example.test/www"
    And the parsed createable subpath is "surveys/forms"
    And the parsed full deployment path is "~/sites/example.test/www/surveys/forms"

  Scenario: A path without /./ is treated as fully pre-existing
    Given the configured deployment path is "~/sites/example.test/www"
    When the deployment path is parsed
    Then the parsed existing root is "~/sites/example.test/www"
    And the parsed createable subpath is empty
    And the parsed full deployment path is "~/sites/example.test/www"

  Scenario: A path with more than one /./ is rejected
    Given the configured deployment path is "~/sites/./example.test/./www"
    When the deployment path is parsed
    Then the deployment path is rejected with "Deployment paths may contain at most one /./ split marker"

  Scenario: A path with /./ but no createable subpath is rejected
    Given the configured deployment path is "~/sites/example.test/www/./"
    When the deployment path is parsed
    Then the deployment path is rejected with "Deployment paths with /./ must include a createable subpath to the right of the split marker"
