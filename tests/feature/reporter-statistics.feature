Feature: Compute reporter totals and per-question statistics
  Scenario: Reporter statistics summarize validated answers per question
    Given survey content:
      """
      {title: Example survey, sections: {basics: {title: Basics, questions: {favorite-color: {title: Favorite color, type: single-choice, content: {red: Red, blue: Blue}}, hobbies: {title: Hobbies, type: multi-choice, content: {music: Music, sports: Sports}}, notes: {title: Notes, type: free-text}, matches: {title: Associate phrases, type: associative, content: {left: {"1": Calm}, right: {A: Blue, B: Green}}}}}}}
      """
    And saved answer files are:
      """
      [{surveyTitle: Example survey, answers: {favorite-color: {type: single-choice, value: blue}, hobbies: {type: multi-choice, value: [music]}, notes: {type: free-text, value: Calm}, matches: {type: associative, value: [{left: "1", right: A}]}}}, {surveyTitle: Example survey, answers: {favorite-color: {type: single-choice, value: red}, hobbies: {type: multi-choice, value: [music, sports]}, notes: {type: free-text, value: Calm}, matches: {type: associative, value: [{left: "1", right: B}]}}}]
      """
    When reporter statistics are computed
    Then the respondent count is 2
    And single-choice question "favorite-color" option "blue" has count 1 and percentage 50
    And multi-choice question "hobbies" option "music" has count 2 and percentage 100
    And free-text question "notes" answer "Calm" has count 2 and percentage 100
    And associative question "matches" pair "1:B" has count 1 and percentage 50
