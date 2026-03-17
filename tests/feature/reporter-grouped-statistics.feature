Feature: Compute grouped reporter statistics parameters
  Scenario: Reporter statistics can group respondents by selected question identifiers
    Given survey content:
      """
      {title: Example survey, sections: {basics: {title: Basics, questions: {favorite-color: {title: Favorite color, type: single-choice, content: {red: Red, blue: Blue}}, notes: {title: Notes, type: free-text}}}}}
      """
    And saved answer files are:
      """
      [{surveyTitle: Example survey, answers: {favorite-color: {type: single-choice, value: blue}, notes: {type: free-text, value: First}}}, {surveyTitle: Example survey, answers: {favorite-color: {type: single-choice, value: blue}, notes: {type: free-text, value: Second}}}, {surveyTitle: Example survey, answers: {favorite-color: {type: single-choice, value: red}, notes: {type: free-text, value: Third}}}]
      """
    And reporter statistics are grouped by question identifiers:
      """
      [favorite-color]
      """
    And the recipient count is 4
    When reporter statistics are computed
    Then grouped result "favorite-color=blue" has respondent count 2 and recipient percentage 50
    And grouped result "favorite-color=red" has respondent count 1 and recipient percentage 25
