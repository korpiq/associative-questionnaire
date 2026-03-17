Feature: Persist saved survey answers through the shared saver path
  Scenario: A valid survey submission is written into the survey answers directory
    Given an empty saver home directory
    And the survey name is "example-survey"
    And survey content:
      """
      {title: Example survey, sections: {basics: {title: Basics, questions: {favorite-color: {title: Favorite color, type: single-choice, content: {red: Red, blue: Blue}}, notes: {title: Notes, type: free-text}}}}}
      """
    And the URL-encoded request body is:
      """
      favorite-color=blue&notes=First+note
      """
    And the CGI request headers are:
      """
      {REMOTE_ADDR: 203.0.113.10, HTTP_USER_AGENT: ExampleBrowser/1.0, HTTP_ACCEPT_LANGUAGE: "en-US,en;q=0.9"}
      """
    When the survey submission is saved
    Then one saved answer file exists for the survey
    And the saved answer file contains:
      """
      {surveyTitle: Example survey, answers: {favorite-color: {type: single-choice, value: blue}, notes: {type: free-text, value: First note}}}
      """

  Scenario: Saving again for the same respondent replaces the existing survey answer file
    Given an empty saver home directory
    And the survey name is "example-survey"
    And survey content:
      """
      {title: Example survey, sections: {basics: {title: Basics, questions: {favorite-color: {title: Favorite color, type: single-choice, content: {red: Red, blue: Blue}}, notes: {title: Notes, type: free-text}}}}}
      """
    And the first URL-encoded request body is:
      """
      favorite-color=red&notes=First+note
      """
    And the replacement URL-encoded request body is:
      """
      favorite-color=blue&notes=Updated+note
      """
    And the CGI request headers are:
      """
      {REMOTE_ADDR: 203.0.113.10, HTTP_USER_AGENT: ExampleBrowser/1.0, HTTP_ACCEPT_LANGUAGE: "en-US,en;q=0.9"}
      """
    When the first survey submission is saved
    And the replacement survey submission is saved
    Then one saved answer file exists for the survey
    And the saved answer file contains:
      """
      {surveyTitle: Example survey, answers: {favorite-color: {type: single-choice, value: blue}, notes: {type: free-text, value: Updated note}}}
      """
