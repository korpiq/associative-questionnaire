Feature: Compute reporter correctness statistics for questions with correct answers
  Scenario: Correctness counts are reported only for questions that define correct answers
    Given survey content:
      """
      {
        title: Example survey,
        sections: {
          basics: {
            title: Basics,
            questions: {
              favorite-color: {
                title: Favorite color,
                type: single-choice,
                content: {
                  red: Red,
                  blue: Blue
                },
                correct: blue
              },
              hobbies: {
                title: Hobbies,
                type: multi-choice,
                content: {
                  music: Music,
                  sports: Sports
                },
                correct: [music, sports]
              },
              notes: {
                title: Notes,
                type: free-text,
                correct: [Calm]
              },
              matches: {
                title: Associate phrases,
                type: associative,
                content: {
                  left: {
                    "1": Calm
                  },
                  right: {
                    A: Blue,
                    B: Green
                  }
                },
                correct: [{left: "1", right: B}]
              },
              comment: {
                title: Comment,
                type: free-text
              }
            }
          }
        }
      }
      """
    And saved answer files are:
      """
      [
        {
          surveyTitle: Example survey,
          answers: {
            favorite-color: {
              type: single-choice,
              value: blue
            },
            hobbies: {
              type: multi-choice,
              value: [music]
            },
            notes: {
              type: free-text,
              value: Calm
            },
            matches: {
              type: associative,
              value: [{left: "1", right: B}]
            },
            comment: {
              type: free-text,
              value: Hello
            }
          }
        },
        {
          surveyTitle: Example survey,
          answers: {
            favorite-color: {
              type: single-choice,
              value: red
            },
            hobbies: {
              type: multi-choice,
              value: [music, sports]
            },
            notes: {
              type: free-text,
              value: Loud
            },
            matches: {
              type: associative,
              value: [{left: "1", right: A}]
            },
            comment: {
              type: free-text,
              value: World
            }
          }
        }
      ]
      """
    When reporter statistics are computed
    Then question "favorite-color" has correct 1 incorrect 1 correct percentage 50
    And question "hobbies" has correct 1 incorrect 1 correct percentage 50
    And question "notes" has correct 1 incorrect 1 correct percentage 50
    And question "matches" has correct 1 incorrect 1 correct percentage 50
    And question "comment" has no correctness statistics
