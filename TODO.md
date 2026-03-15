# TODO

1. Define the questionnaire domain model and Zod schemas first.
   This establishes a stable contract for generator input, reporter input, and saved answers.

2. Add feature specs for the first narrow slice.
   Start with generator behavior for one section containing one question of each basic type.

3. Implement the HTML generator before the CGI or reporter.
   This is the core user-facing artifact and will force stable identifiers, form field names, and associative-question serialization.

4. Decide the answer file format explicitly.
   The README says results are stored as JSON, but the exact structure still needs to be locked down before writing the CGI script.

5. Build the CGI saver after the generator and finalized answer format.
   It should validate and persist the same answer structure the rest of the system expects.

6. Build the reporter last.
   It should consume the validated questionnaire content and saved answer files to produce totals, percentages, grouped statistics, and graphs.
