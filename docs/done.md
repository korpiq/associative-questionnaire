# Done

1. Defined the questionnaire domain model and Zod schemas.
   Added validated TypeScript/Zod schemas for questionnaire content and saved answer files.

2. Decided the answer file format explicitly.
   Locked the saved-answer JSON structure into the schema layer so later CGI and reporter work can build against it.

3. Reused identical schema parsing `When` steps through `@amiceli/vitest-cucumber` shared steps.
   Centralized the repeated execution step with `defineSteps` so scenarios keep one source of truth for the parse action.
