Feature: Survey schema validation
  Scenario: Valid survey content is accepted
    Given survey content:
      """
      {title: Example survey, sections: {basics: {title: Basics, questions: {favorite-color: {title: Favorite color, type: single-choice, content: {red: Red, blue: Blue}}, hobbies: {title: Hobbies, type: multi-choice, content: {music: Music, sports: Sports}}, notes: {title: Notes, type: free-text}, matches: {title: Associate phrases, type: associative, content: {left: {"1": Calm, "2": Precise}, right: {A: Blue, B: Green}}}}}}}
      """
    When the survey content is parsed with the schema
    Then the parsed survey is:
      """
      {title: Example survey, sections: {basics: {title: Basics}}}
      """

  Scenario: Invalid associative survey content is rejected
    Given survey content:
      """
      {title: Broken survey, sections: {broken: {title: Broken section, questions: {invalid-association: {title: Bad association, type: associative, content: {left: {"1": First}, right: {AA: Too long}}}}}}}
      """
    When the survey content is parsed with the schema
    Then the survey content is rejected
    And the schema issues are:
      """
      [{path: [sections, broken, questions, invalid-association, content, right, AA], message: Associative right group keys must be single letters}]
      """
