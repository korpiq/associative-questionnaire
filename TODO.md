# TODO

1. Implement the HTML generator before the CGI or reporter.
   This is the core user-facing artifact and will force stable identifiers, form field names, and associative-question serialization.

2. Build the CGI saver after the generator and finalized answer format.
   It should validate and persist the same answer structure the rest of the system expects.

3. Build the reporter last.
   It should consume the validated questionnaire content and saved answer files to produce totals, percentages, grouped statistics, and graphs.
