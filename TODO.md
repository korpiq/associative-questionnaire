# TODO

## survey customization

Surveys should have customizable success and failure pages and CSS file for saver and reporter. So each survey should have its own directory on the webserver to contain all those.

Contents for each of them can come from separate files or the template html.
Add success and fail portions to the default template for that.

## Custom CSS and scripts should override defaults individually 

Custom CSS and script sections should add to or override existing individual entries or functions in the respective sets.

## deployment targets

- add support for `targets/<target-name>/target.json` with surveys discovered from `targets/<target-name>/surveys/`
- implement `/./` path splitting in deployment path handling so the left side must already exist and the right side may be created by deployment
- refactor deployment commands to take a target configuration name instead of raw SSH or container arguments
- update SSH deployment and installer logic to use configured `publicPath`, `cgiPath`, `dataDir`, and defaulted `protectionFile`
- update container deployment logic to use target configuration files too

## visual testing should use sample target

Convert visual testing to use a sample target container with sample surveys under /targets/sample/.
