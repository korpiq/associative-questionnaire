Feature: Association linker
  Scenario: Dragging from one phrase to another toggles an association
    Given generated questionnaire HTML with one associative question and fixed phrase positions
    When left phrase "1" starts dragging to point 240 120
    Then the live associative line starts at left phrase "1" and ends at point 240 120
    When left phrase "1" is dragged to right phrase "A"
    Then associative answer "matches" contains pair "1" "A"
    And 1 stored associative lines are visible
    When left phrase "1" is dragged again to right phrase "A"
    Then associative answer "matches" is empty
    And 0 stored associative lines are visible

  Scenario: Keyboard linking toggles an association
    Given generated questionnaire HTML with one associative question and fixed phrase positions
    When left phrase "1" is focused and key "A" is pressed
    Then associative answer "matches" contains pair "1" "A"
    And 1 stored associative lines are visible
