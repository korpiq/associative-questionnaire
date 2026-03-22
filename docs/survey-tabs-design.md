# Survey Tabs Design

## Goal

Render survey sections as tabs while keeping reporting output continuous and printable.

## Survey Page Rules

- sections become tabs on the survey page;
- only the selected tab's contents are shown at a time;
- tab switching is always allowed;
- there are no required fields for now;
- submit does not validate client-side completeness.

## Tab Status

Each tab should show progress status based on answered questions in that section:

- unanswered: zero answered
- partial: some but not all answered
- full: all answered

The status should be visible as a tab-level progress indicator.

## Bottom Navigation

At the bottom of the survey page:

- show `previous` on the left and `next` on the right;
- each button takes half the available width, minus margins;
- `previous` is disabled on the first tab;
- `submit` replaces `next` on the last tab;
- if the survey has no sections/tabs, show one full-width `submit` button.

## Submit Behavior

- submit should send all currently available form data from all tabs;
- submit should not block on unanswered questions;
- server-side reporting remains the place where answer data is validated.

## Report Rules

- the report page should remain one continuous page without sectioned tab presentation.

## Verification Expectations

This design is satisfied when:

- sections render as tabs on the survey page;
- tab progress states update from current answers;
- users can move freely between tabs;
- bottom navigation follows the first-tab, middle-tab, last-tab, and no-tabs rules;
- submit includes data from all tabs without client-side validation;
- report output remains continuous rather than tabbed.
