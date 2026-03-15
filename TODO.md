# TODO

1. Add a default snippet that provides the associative-question linking JavaScript described under "Association linker" in `README.md`.
   The generated page should include the default linker behavior even before per-template overrides are introduced.

2. Make it possible to override each snippet in the HTML template.
   Template authors should be able to replace default snippet partials from within the template file.

3. Build the CGI saver after the generator and finalized answer format.
   It should validate and persist the same answer structure the rest of the system expects.

4. Build the reporter last.
   It should consume the validated questionnaire content and saved answer files to produce totals, percentages, grouped statistics, and graphs.
