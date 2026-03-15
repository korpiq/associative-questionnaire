Feature: Questionnaire schema validation
  Scenario: Valid questionnaire content is accepted
    Given questionnaire content:
      """
      {title: Example questionnaire, sections: {basics: {title: Basics, questions: {favorite-color: {title: Favorite color, type: single-choice, content: {red: Red, blue: Blue}}, hobbies: {title: Hobbies, type: multi-choice, content: {music: Music, sports: Sports}}, notes: {title: Notes, type: free-text}, matches: {title: Associate phrases, type: associative, content: {left: {"1": Calm, "2": Precise}, right: {A: Blue, B: Green}}}}}}}
      """
    When the questionnaire content is parsed with the schema
    Then the parsed questionnaire is:
      """
      {title: Example questionnaire, sections: {basics: {title: Basics}}}
      """

  Scenario: Invalid associative questionnaire content is rejected
    Given questionnaire content:
      """
      {title: Broken questionnaire, sections: {broken: {title: Broken section, questions: {invalid-association: {title: Bad association, type: associative, content: {left: {"1": First}, right: {AA: Too long}}}}}}}
      """
    When the questionnaire content is parsed with the schema
    Then the questionnaire content is rejected
    And the schema issues are:
      """
      [{path: [sections, broken, questions, invalid-association, content, right, AA], message: Associative right group keys must be single letters}]
      """
