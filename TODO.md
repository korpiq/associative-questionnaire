# TODO

## survey customization

Surveys should have customizable success and failure pages and CSS file for saver and reporter. So each survey should have its own directory on the webserver to contain all those.

Contents for each of them can come from separate files or the template html.
Add success and fail portions to the default template for that.

## Custom CSS and scripts should override defaults individually 

Custom CSS and script sections should add to or override existing individual entries or functions in the respective sets.

## deployment targets

- generate target-based saver and reporter CGI assets with configured runtime paths and URLs
- refactor deployment commands to take a target configuration name instead of raw SSH or container arguments
- update container deployment logic to use target configuration files and generated target-based assets
- update SSH deployment and installer logic to use configured `publicPath`, `cgiPath`, `dataDir`, and defaulted `protectionFile`
  SSH runtime paths must not depend on `HOME`; use absolute configured paths or derive them from `SCRIPT_FILENAME`.
  On the SSH host, generated CGI assets should use injected absolute settings or derive related paths from absolute `SCRIPT_FILENAME`.

## visual testing should use sample target

Convert visual testing to use a sample target container with sample surveys under /targets/sample/.
