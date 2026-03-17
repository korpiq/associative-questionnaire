Feature: Association linker
  Scenario: Dragging from one phrase to another toggles an association
    Given generated survey HTML with one associative question and fixed phrase positions
    When the right-side handle of left phrase "1" starts dragging to point 240 120
    Then the live associative line starts at left phrase "1" and ends at point 240 120
    And left phrase "1" is marked pending
    When left phrase "1" starts dragging to point 240 120
    Then the live associative line again starts at left phrase "1" and ends at point 240 120
    And left phrase "1" remains marked pending
    When left phrase "1" box is dragged to right phrase "A"
    Then associative answer "matches" contains pair "1" "A"
    And the live associative line is hidden
    And 1 stored associative lines are visible
    When left phrase "1" box is dragged again to right phrase "A"
    Then associative answer "matches" is empty
    And the live associative line is hidden after the link is undone
    And 0 stored associative lines are visible

  Scenario: Keyboard linking toggles an association
    Given generated survey HTML with one associative question and fixed phrase positions
    When left phrase "1" is focused and key "A" is pressed
    Then associative answer "matches" contains pair "1" "A"
    And the live associative line is hidden
    And 1 stored associative lines are visible

  Scenario: Tapping one phrase and then the opposite side toggles an association
    Given generated survey HTML with one associative question and fixed phrase positions
    When left phrase "1" is tapped
    Then left phrase "1" is marked pending
    When right phrase "A" is tapped
    Then associative answer "matches" contains pair "1" "A"
    And the live associative line is hidden
    And 1 stored associative lines are visible
    When left phrase "1" is tapped again
    And right phrase "A" is tapped again
    Then associative answer "matches" is empty
    And the live associative line is hidden after tapping the link again
    And 0 stored associative lines are visible

  Scenario: Touch dragging from one phrase to another toggles an association
    Given generated survey HTML with one associative question and fixed phrase positions
    When left phrase "1" is touch-dragged to right phrase "A"
    Then associative answer "matches" contains pair "1" "A"
    And the live associative line is hidden after touch drag
    And 1 stored associative lines are visible
    When left phrase "1" is touch-dragged again to right phrase "A"
    Then associative answer "matches" is empty
    And the live associative line is hidden after touch drag is undone
    And 0 stored associative lines are visible
