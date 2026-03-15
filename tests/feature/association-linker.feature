Feature: Association linker
  Scenario: Dragging from one phrase to another toggles an association
    Given generated questionnaire HTML with one associative question
    When left phrase "1" is dragged to right phrase "A"
    Then associative answer "matches" contains pair "1" "A"
    When left phrase "1" is dragged again to right phrase "A"
    Then associative answer "matches" is empty

  Scenario: Keyboard linking toggles an association
    Given generated questionnaire HTML with one associative question
    When left phrase "1" is focused and key "A" is pressed
    Then associative answer "matches" contains pair "1" "A"
