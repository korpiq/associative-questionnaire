Feature: Render reporter graphics in the HTML report page
  Scenario: Reporter HTML page includes visual bars for percentages
    Given survey content:
      """
      {title: Example survey, sections: {basics: {title: Basics, questions: {favorite-color: {title: Favorite color, type: single-choice, content: {red: Red, blue: Blue}}}}}}
      """
    And saved answer files are:
      """
      [{surveyTitle: Example survey, answers: {favorite-color: {type: single-choice, value: blue}}}, {surveyTitle: Example survey, answers: {favorite-color: {type: single-choice, value: blue}}}, {surveyTitle: Example survey, answers: {favorite-color: {type: single-choice, value: red}}}]
      """
    When the reporter HTML page is rendered for "example-survey"
    Then the reporter HTML page contains "data-bar-chart"
    And the reporter HTML page contains:
      """
      width: 66.66666666666666%
      """
