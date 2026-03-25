Feature: Build v3 deployment package file trees

  Scenario: Tarball archives absolute-path entries for a container target
    Given an isolated workspace for v3 deployment package building
    And the isolated workspace has a container target with absolute paths and one survey
    When I build the deployment package for that target
    Then the deployment package tarball entries are:
      """
      /app/
      /app/cgi-bin/
      /app/cgi-bin/basic/
      /app/cgi-bin/basic/report.cgi
      /app/cgi-bin/basic/save.cgi
      /app/data/
      /app/data/basic/
      /app/data/basic/survey.json
      /app/surveys/
      /app/surveys/basic/
      /app/surveys/basic/fail.html
      /app/surveys/basic/index.html
      /app/surveys/basic/ok.html
      /app/surveys/index.html
      """

  Scenario: Tarball archives relative-path entries for an SSH target
    Given an isolated workspace for v3 deployment package building
    And the isolated workspace has an SSH target with relative paths and one survey
    When I build the deployment package for that target
    Then the deployment package tarball entries are:
      """
      sites/
      sites/example.test/
      sites/example.test/www/
      sites/example.test/www/cgi-bin/
      sites/example.test/www/cgi-bin/basic/
      sites/example.test/www/cgi-bin/basic/report.cgi
      sites/example.test/www/cgi-bin/basic/save.cgi
      sites/example.test/www/data/
      sites/example.test/www/data/basic/
      sites/example.test/www/data/basic/survey.json
      sites/example.test/www/surveys/
      sites/example.test/www/surveys/basic/
      sites/example.test/www/surveys/basic/fail.html
      sites/example.test/www/surveys/basic/index.html
      sites/example.test/www/surveys/basic/ok.html
      sites/example.test/www/surveys/index.html
      """

  Scenario: Generated deploy.sh streams the tarball into SSH
    Given an isolated workspace for v3 deployment package building
    And the isolated workspace has an SSH target with relative paths and one survey
    When I build the deployment package for that target
    Then the deployment package deploy.sh streams the tarball into ssh

  Scenario: Generated deploy.sh streams the tarball into docker exec
    Given an isolated workspace for v3 deployment package building
    And the isolated workspace has a container target with absolute paths and one survey
    When I build the deployment package for that target
    Then the deployment package deploy.sh streams the tarball into docker exec

  Scenario: SSH and container targets produce identical local file lists for the same paths
    Given an isolated workspace for v3 deployment package building
    And the isolated workspace has an SSH target with relative paths and one survey
    When I build the deployment package for that target
    And I also build the deployment package for a container target with identical paths and the same survey
    Then both deployment packages contain the same relative file paths under files/
