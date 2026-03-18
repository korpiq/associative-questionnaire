Feature: Generate survey HTML page
  Scenario: Generate a standalone page with one section and all supported question types
    Given survey content:
      """
      {
        title: Example survey,
        description: Example description,
        sections: {
          basics: {
            title: Basics,
            description: Basic prompts,
            questions: {
              favorite-color: {
                title: Favorite color,
                type: single-choice,
                content: {
                  red: Red,
                  blue: Blue
                }
              },
              hobbies: {
                title: Hobbies,
                type: multi-choice,
                content: {
                  music: Music,
                  sports: Sports
                }
              },
              notes: {
                title: Notes,
                type: free-text
              },
              matches: {
                title: Associate phrases,
                type: associative,
                content: {
                  left: {
                    "1": Calm
                  },
                  right: {
                    A: Blue
                  }
                }
              }
            }
          }
        }
      }
      """
    And the survey file path is "surveys/example-survey.json"
    And the form action URL is "https://example.test/cgi-bin/save-survey.js"
    And HTML template:
      """
      {{> root}}
      """
    When the survey HTML page is generated
    Then the result is a standalone HTML page
    And the result contains the survey title "Example survey"
    And the result contains the survey description "Example description"
    And the result contains the section title "Basics"
    And the result contains the section description "Basic prompts"
    And the result contains the single-choice question title "Favorite color"
    And the result contains the multi-choice question title "Hobbies"
    And the result contains the free-text question title "Notes"
    And the result contains the associative question title "Associate phrases"
    And the result contains the associative left phrase "Calm"
    And the result contains the associative right phrase "Blue"
    And the result posts to "https://example.test/cgi-bin/save-survey.js?surveyName=example-survey"
    And the result uses method "post"
    And the result exposes the survey name "example-survey"
    And the result contains the submit button text "Submit survey"
