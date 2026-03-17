Feature: Parse CGI saver request bodies into saved survey answers
  Scenario: URL-encoded browser form bodies are parsed and normalized
    Given survey content:
      """
      {title: Example survey, sections: {basics: {title: Basics, questions: {favorite-color: {title: Favorite color, type: single-choice, content: {red: Red, blue: Blue}}, hobbies: {title: Hobbies, type: multi-choice, content: {music: Music, sports: Sports}}, notes: {title: Notes, type: free-text}, matches: {title: Associate phrases, type: associative, content: {left: {"1": Calm}, right: {A: Blue}}}}}}}
      """
    And the URL-encoded request body is:
      """
      favorite-color=blue&hobbies=music&hobbies=sports&notes=Example+note&matches=%5B%7B%22left%22%3A%221%22%2C%22right%22%3A%22A%22%7D%5D
      """
    When the URL-encoded request body is normalized for saving
    Then the saved answer file is:
      """
      {surveyTitle: Example survey, answers: {favorite-color: {type: single-choice, value: blue}, hobbies: {type: multi-choice, value: [music, sports]}, notes: {type: free-text, value: Example note}, matches: {type: associative, value: [{left: "1", right: A}]}}}
      """
