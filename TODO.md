# TODO

- Dragging lines to associate phrases on the left and right in "matches" type questions works on desktop but not in mobile. Make pressing down on a phrase and then dragging in mobile drag line like it does on desktop.

- Make an example showing how to override each of our HTML snippets.

- Rework Gherkin scenarios to avoid repeated step text where the parser rejects repetition.
  Prefer clearer scenario structure over repeated identical lines once the current implementation work is stable.

- Build the CGI saver after the generator and finalized answer format.
  It should validate and persist the same answer structure the rest of the system expects.

- Build the reporter last.
  It should consume the validated questionnaire content and saved answer files to produce totals, percentages, grouped statistics, and graphs.
