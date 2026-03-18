Feature: Survey schema validation
  Scenario: Valid survey content is accepted
    Given survey content:
      """
      {
        title: Example survey,
        protected: true,
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
                correct: red
              },
              hobbies: {
                title: Hobbies,
                type: multi-choice,
                content: {
                  music: Music,
                  sports: Sports
                },
                correct: [music]
              },
              notes: {
                title: Notes,
                type: free-text,
                correct: [Calm, Precise]
              },
              matches: {
                title: Associate phrases,
                type: associative,
                content: {
                  left: {
                    "1": Calm,
                    "2": Precise
                  },
                  right: {
                    A: Blue,
                    B: Green
                  }
                },
                correct: [{left: "1", right: A}]
              }
            }
          }
        }
      }
      """
    When the survey content is parsed with the schema
    Then the parsed survey is:
      """
      {
        title: Example survey,
        protected: true,
        sections: {
          basics: {
            title: Basics,
            questions: {
              favorite-color: {
                correct: red
              },
              hobbies: {
                correct: [music]
              },
              notes: {
                correct: [Calm, Precise]
              },
              matches: {
                correct: [{left: "1", right: A}]
              }
            }
          }
        }
      }
      """

  Scenario: Invalid associative survey content is rejected
    Given survey content:
      """
      {
        title: Broken survey,
        sections: {
          broken: {
            title: Broken section,
            questions: {
              invalid-association: {
                title: Bad association,
                type: associative,
                content: {
                  left: {
                    "1": First
                  },
                  right: {
                    AA: Too long
                  }
                }
              }
            }
          }
        }
      }
      """
    When the survey content is parsed with the schema
    Then the survey content is rejected
    And the schema issues are:
      """
      [
        {
          path: [sections, broken, questions, invalid-association, content, right, AA],
          message: Associative right group keys must be single letters
        }
      ]
      """

  Scenario: Invalid survey-level protected metadata is rejected
    Given survey content:
      """
      {
        title: Bad protection,
        protected: yes,
        sections: {
          basics: {
            title: Basics
          }
        }
      }
      """
    When the survey content is parsed with the schema
    Then the survey content is rejected
    And the schema issues are:
      """
      [
        {
          path: [protected],
          message: "Expected boolean, received string"
        }
      ]
      """

  Scenario: Invalid correct answers are rejected
    Given survey content:
      """
      {
        title: Broken answers,
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
                correct: green
              },
              hobbies: {
                title: Hobbies,
                type: multi-choice,
                content: {
                  music: Music,
                  sports: Sports
                },
                correct: [reading]
              },
              matches: {
                title: Associate phrases,
                type: associative,
                content: {
                  left: {
                    "1": Calm
                  },
                  right: {
                    A: Blue
                  }
                },
                correct: [{left: "2", right: A}]
              }
            }
          }
        }
      }
      """
    When the survey content is parsed with the schema
    Then the survey content is rejected
    And the schema issues are:
      """
      [
        {
          path: [sections, basics, questions, favorite-color, correct],
          message: Correct answer must match one of the defined options
        },
        {
          path: [sections, basics, questions, hobbies, correct, 0],
          message: Each correct answer must match one of the defined options
        },
        {
          path: [sections, basics, questions, matches, correct, 0, left],
          message: Correct associative left key must match a defined left-side phrase
        }
      ]
      """
