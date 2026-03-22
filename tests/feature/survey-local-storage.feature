Feature: Survey local storage
  Scenario: Editing a survey stores local state and restores it on reload for the same page URL
    Given generated survey HTML with local-storage coverage at page URL "https://example.test/surveys/storage/"
    When I choose single-choice answer "blue" for "favorite-color"
    And I choose multi-choice answer "music" for "hobbies"
    And I fill free-text answer "Remember this answer" for "notes"
    And I set associative answer "matches" to pair "1" "A"
    Then local survey state is stored for the current page URL
    When I reload the survey page from local storage
    Then single-choice answer "blue" is restored for "favorite-color"
    And multi-choice answer "music" is restored for "hobbies"
    And free-text answer "Remember this answer" is restored for "notes"
    And associative answer "matches" contains pair "1" "A"
    And 1 stored associative lines are visible

  Scenario: Local storage overrides survey defaults on page load
    Given generated survey HTML with local-storage coverage at page URL "https://example.test/surveys/storage/"
    And the generated survey HTML defaults single-choice question "favorite-color" to "red"
    And the generated survey HTML defaults free-text question "notes" to "Default note"
    And the current page already has local survey state with:
      """
      {
        favorite-color: blue,
        hobbies: [music],
        notes: Stored note,
        matches: [{ left: "1", right: "A" }]
      }
      """
    When I load the survey page with saved local state
    Then single-choice answer "blue" is restored for "favorite-color"
    And multi-choice answer "music" is restored for "hobbies"
    And free-text answer "Stored note" is restored for "notes"
    And associative answer "matches" contains pair "1" "A"

  Scenario: Submit leaves local survey state intact
    Given generated survey HTML with local-storage coverage at page URL "https://example.test/surveys/storage/"
    When I choose single-choice answer "blue" for "favorite-color"
    And I submit the survey form
    Then local survey state still stores single-choice answer "blue" for "favorite-color"

  Scenario: Expired local survey state is ignored and removed
    Given generated survey HTML with local-storage coverage at page URL "https://example.test/surveys/storage/"
    And the current page has expired local survey state with:
      """
      {
        favorite-color: blue,
        notes: Expired note
      }
      """
    When I load the survey page with saved local state
    Then no local survey state remains for the current page URL
    And no single-choice answer is restored for "favorite-color"
    And free-text answer "" is restored for "notes"
