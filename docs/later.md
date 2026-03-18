# Add to todo later

## Survey sections as tabs 

Report should show all results on a continuous page without sections for easy printing.
 
- Turn sections into tabs on the survey page, so that their titles are shown neatly spaced and visually represented as tabs above an area where only the selected section's contents are shown.
- Add visual hints whether a section is unanswered or partially or fully answered. This could be a dimly colored (light gray?) progress bar under each tab, showing the percentage of answered questions in that section as a more deeply colored (dark gray?) bar on it. 

## Keep survey answers in local storage

- whenever form state changes, save it to local storage
- when landing on the page, populate form and its visualizations from the local storage

## Provide a CGI script to upload new surveys

Once a container is deployed, it cannot be taken down as it may contain answer files.
Answer files should not leave the storage they are in as they are not anonymized.

- ensure save and report scripts are not dependent on injected stuff of specific surveys
- upload script should accept tar.gz and/or zip file
- it should check that the extract paths are correct for the target environment and contain expected files only
- then it can extract them and check their permissions
- provide a sender script for sending new surveys to a target (takes path to survey directory, uses target from target directory of that path)

## Use public key to encrypt answers

- generate public-private key pair as part of survey installation
- inject secret key into the survey json file seen by report script
- make survey page encrypt its contents with the public key (is there minimal reliable way to do this in all browsers? crypto?)
- change save script to save opaque encrypted blobs as answer files
- make report script decrypt answer files by secret key in survey json
