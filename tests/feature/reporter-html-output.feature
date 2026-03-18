Feature: Render reporter HTML output
  Scenario: Reporter HTML page shows the survey title, totals, and per-question statistics
    Given survey content:
      """
      {title: Example survey, sections: {basics: {title: Basics, questions: {favorite-color: {title: Favorite color, type: single-choice, content: {red: Red, blue: Blue}}, notes: {title: Notes, type: free-text}}}}}
      """
    And saved answer files are:
      """
      [{surveyTitle: Example survey, answers: {favorite-color: {type: single-choice, value: blue}, notes: {type: free-text, value: Calm}}}, {surveyTitle: Example survey, answers: {favorite-color: {type: single-choice, value: red}, notes: {type: free-text, value: Loud}}}]
      """
    When the reporter HTML page is rendered for "example-survey"
    Then the reporter HTML page contains "Example survey"
    And the reporter HTML page contains "Survey name: example-survey"
    And the reporter HTML page contains "Respondents: 2"
    And the reporter HTML page contains "Favorite color"
    And the reporter HTML page contains "Blue"
    And the reporter HTML page contains "Notes"
