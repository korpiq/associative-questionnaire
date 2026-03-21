# Add to todo later


Needs clarification before I’d claim confidence:
•
scripts/test-visual.sh: is this supposed to remain a manual helper, or is it required supported automated test coverage? Right now it behaves like a manual/demo script more than a CI-style test.
•
deployment scripting section: the container side says it “may have to” copy/extract/remove tarball. That is still a design direction, not a precise acceptance criterion. I’d want confirmation whether you want:
◦
parity with SSH, meaning the container runtime should also deploy by extracting a tarball into target paths via a setup step, or
◦
the current tarball-only image build to count as sufficient
•
Keep survey answers in local storage: implementationally clear enough to build, but not fully specified on precedence. I’d want one decision:
◦
if local storage and server-rendered/default values differ, should local storage always win?
•
Survey sections as tabs: mostly clear, but I’d want one UX rule confirmed:
◦
should hidden sections still validate on submit, or only the active tab as the user navigates?
•
Custom CSS and scripts should override defaults individually: this is the least precise of the product items. I need to know the intended input shape. For example:
◦
are overrides keyed by snippet name/function name in JSON?
◦
is this still template-driven partial override behavior, or a new survey-config field?
•
Provide a CGI script to upload new surveys: this is feasible, but it needs the most product clarification before I’d call it safe. I’d want answers to:
◦
exact upload endpoint/auth model, if any
◦
whether uploaded surveys replace existing ones by name
◦
canonical archive format: tar.gz, zip, or both
◦
exact allowed file layout inside the archive
◦
whether sender script targets container, SSH, or both
So the short version is: I can confidently continue through the remaining migration TODOs, but I would pause for clarification before starting the product-feature items, especially snippet overrides and survey upload.
