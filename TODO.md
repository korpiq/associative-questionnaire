# TODO

1. Write down the shared-step testing approach in `docs/testing.md`.
   Make it a short guide to our testing method overall, note it in `README.md`, and refer to `README.md` from `AGENTS.md`.

2. Change questionnaire schemas so questionnaire JSON stores section and question lists as keyed objects instead of arrays of objects with separate `id` fields.
   This should apply to the schema definitions and their tests.

3. Document use of the generator as planned so far in a document under `docs/`.
   Capture the currently agreed inputs, outputs, and expected usage flow.

4. Add feature specs for the first narrow slice.
   Start with generator behavior for one section containing one question of each basic type.

5. Normalize schema-validated questionnaire collections into a predictable ordered internal representation.
   Sections and questions may arrive as arrays or keyed objects, but generator and reporter logic should consume one stable shape.

6. Implement the HTML generator before the CGI or reporter.
   This is the core user-facing artifact and will force stable identifiers, form field names, and associative-question serialization.

7. Build the CGI saver after the generator and finalized answer format.
   It should validate and persist the same answer structure the rest of the system expects.

8. Build the reporter last.
   It should consume the validated questionnaire content and saved answer files to produce totals, percentages, grouped statistics, and graphs.
