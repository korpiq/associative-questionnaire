Feature: Generator snippet overrides
  Scenario: Template overrides replace default snippets
    Given questionnaire content:
      """
      {title: Override example, description: Override description, sections: {basics: {title: Basics, questions: {notes: {title: Notes, type: free-text}}}}}
      """
    And HTML template:
      """
      {{#*inline "section"}}
      <section data-section="{{id}}">
      <h2>Override {{title}}</h2>
      {{#each questions}}
      {{> question}}
      {{/each}}
      </section>
      {{/inline}}
      {{#*inline "question"}}
      <article data-question="{{id}}">
      <h3>Override {{title}}</h3>
      <div class="override-question">{{{contentHtml}}}</div>
      </article>
      {{/inline}}
      {{#*inline "style"}}
      <style>
      body { background: rgb(250, 240, 230); }
      </style>
      {{/inline}}
      {{#*inline "script"}}
      <script>
      document.documentElement.dataset.overrideScript = 'true';
      </script>
      {{/inline}}
      {{> root}}
      """
    When the questionnaire HTML page is generated
    Then the result contains the section title override "Override Basics"
    And the result contains the question title override "Override Notes"
    And the result contains the style override "background: rgb(250, 240, 230)"
    And the result contains the script override "dataset.overrideScript = 'true'"
