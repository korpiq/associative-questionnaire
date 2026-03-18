# Add to todo later

## Use public key to encrypt answers

- generate public-private key pair as part of survey installation
- inject secret key into the survey json file seen by report script
- make survey page encrypt its contents with the public key (is there minimal reliable way to do this in all browsers? crypto?)
- change save script to save opaque encrypted blobs as answer files
- make report script decrypt answer files by secret key in survey json
