# Local Storage Design

## Goal

Persist survey form state locally in the browser and restore it on return visits.

## Rules

- local storage is the only client-side persisted survey-state source;
- local storage always wins over survey defaults;
- local storage scope is the full survey page URL;
- local state remains after submit;
- local state expires one month after the latest local update.

## Storage Model

Each survey page URL should map to one local-storage record containing:

- saved form state;
- any derived visualization state needed to restore the page;
- an updated-at timestamp used for rolling one-month expiry.

Every local change should refresh the stored timestamp.

## Load Behavior

On page load:

1. read the record for the current page URL;
2. discard it if it is older than one month;
3. otherwise restore the form state and visualizations from local storage;
4. do not fetch or prepare to fetch survey contents from other sources.

## Submit Behavior

- submit should not clear local storage;
- local storage should continue to reflect the most recent locally edited state.

## Verification Expectations

This design is satisfied when:

- editing the form writes local state;
- reloading the same survey page restores local state;
- restored local state overrides defaults;
- submit leaves local state intact;
- expired state is ignored and removed or replaced cleanly;
- no client-side code remains that prepares to load survey contents from outside local storage.
