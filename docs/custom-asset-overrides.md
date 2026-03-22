# Custom Asset Overrides

## Goal

Keep customization simple for now by appending one custom CSS asset and one custom JavaScript asset after the defaults.

## Current Contract

Generated survey pages should support:

- one custom CSS template file appended after the default CSS;
- one custom JavaScript template file appended after the default JavaScript.

Current behavior is append-only.

Do not implement named replacement, partial merge, or function-body patching in this step.

## File Semantics

- default assets remain the baseline;
- custom CSS is emitted after default CSS;
- custom JavaScript is emitted after default JavaScript.

This allows later rules in custom assets to override earlier default behavior through normal CSS and JavaScript ordering.

## Deferred Design

Later, the generator may try to exclude default CSS entries or JavaScript functions whose names also appear in the custom assets.

That later step may use a cheap best-effort string match if necessary.

This document does not require that behavior now.

## Verification Expectations

This design is satisfied when:

- generated output keeps the default CSS and JavaScript;
- one custom CSS file can be appended after the defaults;
- one custom JavaScript file can be appended after the defaults;
- current customization does not depend on named-entry merge behavior.
