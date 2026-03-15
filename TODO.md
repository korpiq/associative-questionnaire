# TODO

1. Document use of the generator as planned so far in a document under `docs/`.
   Capture the currently agreed inputs, outputs, and expected usage flow.

2. Add feature specs for the first narrow slice.
   Start with generator behavior for one section containing one question of each basic type.

3. Normalize schema-validated keyed questionnaire collections into a predictable ordered internal representation.
   Generator and reporter logic should consume one stable shape regardless of object traversal details.

4. Implement the HTML generator before the CGI or reporter.
   This is the core user-facing artifact and will force stable identifiers, form field names, and associative-question serialization.

5. Build the CGI saver after the generator and finalized answer format.
   It should validate and persist the same answer structure the rest of the system expects.

6. Build the reporter last.
   It should consume the validated questionnaire content and saved answer files to produce totals, percentages, grouped statistics, and graphs.
