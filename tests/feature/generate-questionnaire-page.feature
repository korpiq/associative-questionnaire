Feature: Generate questionnaire HTML page
  Scenario: Generate a standalone page with one section and all supported question types
    Given questionnaire content:
      """
      {title: Example questionnaire, description: Example description, sections: {basics: {title: Basics, description: Basic prompts, questions: {favorite-color: {title: Favorite color, type: single-choice, content: {red: Red, blue: Blue}}, hobbies: {title: Hobbies, type: multi-choice, content: {music: Music, sports: Sports}}, notes: {title: Notes, type: free-text}, matches: {title: Associate phrases, type: associative, content: {left: {"1": Calm}, right: {A: Blue}}}}}}}
      """
    And HTML template:
      """
      <html>
      <head><title>{{questionnaire.title}}</title></head>
      <body>
      <form>
      <p>{{questionnaire.description}}</p>
      {{#each questionnaire.sections}}
      {{> section}}
      {{/each}}
      </form>
      </body>
      </html>
      """
    When the questionnaire HTML page is generated
    Then the result is a standalone HTML page
    And the result contains the questionnaire title "Example questionnaire"
    And the result contains the questionnaire description "Example description"
    And the result contains the section title "Basics"
    And the result contains the section description "Basic prompts"
    And the result contains the single-choice question title "Favorite color"
    And the result contains the multi-choice question title "Hobbies"
    And the result contains the free-text question title "Notes"
    And the result contains the associative question title "Associate phrases"
    And the result contains the associative left phrase "Calm"
    And the result contains the associative right phrase "Blue"
