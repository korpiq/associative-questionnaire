Feature: Repository helper coverage
  Scenario: Project bootstrap loads the survey parser export
    When the project bootstrap exports are loaded
    Then the exported survey parser is a function

  Scenario: Target-name helper uses the provided target
    When I read the target name from argv:
      """
      [node, script, staging]
      """
    Then the resolved target name is "staging"

  Scenario: Target-name helper falls back to the default target
    When I read the target name from argv:
      """
      [node, script]
      """
    Then the resolved target name is "sample"

  Scenario: Target-directory helper resolves a target path inside targets
    Given an isolated workspace for deployment path readers
    And the isolated workspace has a target folder "staging"
    When I read the target directory from argv in that workspace:
      """
      [node, script, targets/staging]
      """
    Then the resolved target directory is:
      """
      {
        targetDirectory: /workspace/targets/staging,
        targetName: staging
      }
      """

  Scenario: Survey-directory helper resolves a survey path inside targets
    Given an isolated workspace for deployment path readers
    And the isolated workspace has a survey folder "staging" "onboarding"
    When I read the survey directory from argv in that workspace:
      """
      [node, script, targets/staging/surveys/onboarding]
      """
    Then the resolved survey directory is:
      """
      {
        surveyDirectory: /workspace/targets/staging/surveys/onboarding,
        surveyName: onboarding,
        targetDirectory: /workspace/targets/staging,
        targetName: staging
      }
      """

  Scenario: Discovered target surveys map to generated public survey pages
    Given the loaded deployment target for target listing is:
      """
      {
        targetName: sample,
        type: container,
        containerName: associative-survey-local,
        publicDir: /srv/www/surveys,
        cgiDir: /srv/www/cgi-bin,
        dataDir: /srv/data/surveys,
        baseUrl: http://127.0.0.1,
        port: 18080,
        staticUriPath: /surveys,
        cgiUriPath: /cgi-bin,
        nodeExecutable: /usr/local/bin/node,
        cgiExtension: .cgi,
        targetDirectory: /workspace/targets/sample,
        surveys: [
          {
            surveyName: survey,
            surveyDirectory: /workspace/targets/sample/surveys/survey,
            surveyPath: /workspace/targets/sample/surveys/survey/survey.json,
            templatePath: /workspace/targets/sample/surveys/survey/template.html
          },
          {
            surveyName: override-survey,
            surveyDirectory: /workspace/targets/sample/surveys/override-survey,
            surveyPath: /workspace/targets/sample/surveys/override-survey/survey.json,
            templatePath: /workspace/targets/sample/surveys/override-survey/template.html
          }
        ]
      }
      """
    When the deployed surveys are listed for that target
    Then the listed deployed surveys are:
      """
      [
        {
          publicHtmlFilename: survey.html,
          surveyName: survey,
          surveyPath: /workspace/targets/sample/surveys/survey/survey.json,
          templatePath: /workspace/targets/sample/surveys/survey/template.html
        },
        {
          publicHtmlFilename: override-survey.html,
          surveyName: override-survey,
          surveyPath: /workspace/targets/sample/surveys/override-survey/survey.json,
          templatePath: /workspace/targets/sample/surveys/override-survey/template.html
        }
      ]
      """

  Scenario: Generated container runtime data is copied into the configured runtime directories
    Given an isolated workspace for generated container runtime data
    And the isolated workspace has generated survey and answer files for container runtime installation
    When the generated container runtime data is installed
    Then the installed runtime survey file contains:
      """
      {"title":"Example survey"}
      """
    And the installed runtime answer file contains:
      """
      {"answers":{}}
      """
