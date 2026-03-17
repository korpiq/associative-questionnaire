Feature: Enforce protected reporter upload and report access
  Scenario: Replacing a protected stored survey requires the correct protection hash
    Given an empty protected reporter home directory
    And a protected stored survey named "example-survey" exists
    And the replacement uploaded survey filename is "example-survey.json"
    And the replacement uploaded survey JSON is:
      """
      {"title":"Replacement survey","sections":{"basics":{"title":"Basics","questions":{"favorite-color":{"title":"Favorite color","type":"single-choice","content":{"red":"Red","blue":"Blue"}}}}}}
      """
    And the reporter protection secret is "deploy-secret"
    When the replacement uploaded survey is stored without a protection hash
    Then protected reporter access is rejected with "Protected survey upload requires a valid hash"
    When the replacement uploaded survey is stored with the correct protection hash
    Then the protected survey upload succeeds

  Scenario: Resolving a protected stored survey report requires the correct protection hash
    Given an empty protected reporter home directory
    And a protected stored survey named "example-survey" exists
    And the reporter protection secret is "deploy-secret"
    When the protected reporter survey is resolved without a hash
    Then protected reporter access is rejected with "Protected survey report requires a valid hash"
    When the protected reporter survey is resolved with the correct protection hash
    Then the resolved protected survey title is "Protected survey"
