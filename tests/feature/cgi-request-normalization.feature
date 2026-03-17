Feature: Normalize CGI request fields into saved survey answers
  Scenario: Browser form fields are normalized using the survey definition
    Given survey content:
      """
      {title: Example survey, sections: {basics: {title: Basics, questions: {favorite-color: {title: Favorite color, type: single-choice, content: {red: Red, blue: Blue}}, hobbies: {title: Hobbies, type: multi-choice, content: {music: Music, sports: Sports}}, notes: {title: Notes, type: free-text}, matches: {title: Associate phrases, type: associative, content: {left: {"1": Calm}, right: {A: Blue}}}}}}}
      """
    And browser form fields are:
      """
      {favorite-color: blue, hobbies: [music, sports], notes: Example note, matches: '[{"left":"1","right":"A"}]'}
      """
    When the browser form fields are normalized for saving
    Then the saved answer file is:
      """
      {surveyTitle: Example survey, answers: {favorite-color: {type: single-choice, value: blue}, hobbies: {type: multi-choice, value: [music, sports]}, notes: {type: free-text, value: Example note}, matches: {type: associative, value: [{left: "1", right: A}]}}}
      """

  Scenario: Invalid associative browser form fields are rejected
    Given survey content:
      """
      {title: Example survey, sections: {basics: {title: Basics, questions: {matches: {title: Associate phrases, type: associative, content: {left: {"1": Calm}, right: {A: Blue}}}}}}}
      """
    And browser form fields are:
      """
      {matches: not-json}
      """
    When the browser form fields are normalized for saving
    Then the browser form fields are rejected
    And the normalization error is:
      """
      Associative answer for question "matches" must be valid JSON
      """
