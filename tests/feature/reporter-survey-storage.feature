Feature: Store and resolve reporter surveys by survey name
  Scenario: Uploaded survey JSON is stored under the runtime survey directory
    Given an empty reporter home directory
    And the uploaded survey filename is "example-survey.json"
    And the uploaded survey JSON is:
      """
      {
        "title": "Example survey",
        "sections": {
          "basics": {
            "title": "Basics",
            "questions": {
              "favorite-color": {
                "title": "Favorite color",
                "type": "single-choice",
                "content": {
                  "red": "Red",
                  "blue": "Blue"
                }
              }
            }
          }
        }
      }
      """
    When the uploaded survey is stored for the reporter
    Then the stored survey name is "example-survey"
    And the stored survey file path is ".local/share/associative-survey/surveys/example-survey.json"
    And the stored survey file contains the uploaded survey JSON

  Scenario: Stored survey resolution uses survey name and finds answer files
    Given an empty reporter home directory
    And the uploaded survey filename is "example-survey.json"
    And the uploaded survey JSON is:
      """
      {
        "title": "Example survey",
        "sections": {
          "basics": {
            "title": "Basics",
            "questions": {
              "favorite-color": {
                "title": "Favorite color",
                "type": "single-choice",
                "content": {
                  "red": "Red",
                  "blue": "Blue"
                }
              }
            }
          }
        }
      }
      """
    And a saved answer file exists for the survey
    When the uploaded survey is stored for the reporter
    And the reporter resolves the stored survey by survey name
    Then the resolved survey title is "Example survey"
    And the resolved answer file count is 1
