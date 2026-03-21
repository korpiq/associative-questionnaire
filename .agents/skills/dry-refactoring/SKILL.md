---
name: dry-refactoring
description: Perform a small-scope DRY refactoring by replacing one set of truly identical repeated code with a shared helper or function. Use when the user or repository instructions explicitly ask for a "DRY refactoring", especially after a task result has been committed and there may be repeated code in tests or production files.
---

# Dry Refactoring

Perform one narrowly scoped deduplication at a time. Prefer the smallest refactor that removes one set of identical repeated code without changing behavior.

## Workflow

1. Check for staged or uncommitted code files. If any exist, commit them with a proper commit message before starting DRY refactoring so the pre-refactor state is preserved.
2. Run the repository's standard verification commands and make sure they pass on that pre-refactor state.
3. Inspect files in the latest commit that introduced new code.
4. If a repeated block matches code inside that scope and code outside it, include the matching outside file in the same refactor.
5. Find one set of truly identical repeated code.
6. Stop after selecting one set. Do not batch multiple unrelated refactors together.
7. Extract the shared code into one helper or function only if that shortens the code overall.
8. Keep behavior unchanged.
9. If the extraction makes the code longer or more indirect, abandon that refactor and look for another repeated block.
10. Run the repository's standard verification commands after the change.
11. If tests pass, commit that DRY refactor as its own follow-up commit.
12. After a successful DRY-refactor commit, continue scanning files from the original scope and repeat the skill until each repeated-code pattern has been either refactored or explicitly rejected.
13. Track the remaining or rejected repeated-code patterns in repository tracking such as `TODO.md` and/or in the DRY refactoring commit messages.

## Good Targets

- Repeated step implementations in tests with the same body.
- Repeated response/assertion helpers.
- Repeated production logic with identical statements and parameters.

## Avoid

- Near-matches that require branching or added abstraction.
- Refactors that combine several repeated-code sets in one change.
- Refactors that only move code around without reducing duplication.
