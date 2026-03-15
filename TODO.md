# TODO

1. Add feature specs for the first narrow slice.
   Start with generator behavior for one section containing one question of each basic type.

2. Normalize schema-validated questionnaire collections into a predictable ordered internal representation.
   Sections and questions may arrive as arrays or keyed objects, but generator and reporter logic should consume one stable shape.

3. Implement the HTML generator before the CGI or reporter.
   This is the core user-facing artifact and will force stable identifiers, form field names, and associative-question serialization.

4. Build the CGI saver after the generator and finalized answer format.
   It should validate and persist the same answer structure the rest of the system expects.

5. Build the reporter last.
   It should consume the validated questionnaire content and saved answer files to produce totals, percentages, grouped statistics, and graphs.
