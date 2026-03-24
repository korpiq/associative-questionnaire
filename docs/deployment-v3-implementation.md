# Deployment v3 implementation notes

## Unverified Docker/SSH integration changes

The following changes were made during automated implementation but could not be live-tested because Docker and SSH infrastructure are not available in the sandbox. Verify these interactively before relying on them.

### Container deployment tests

`tests/integration/container-deployment.feature` and `cookie-based-container-deployment.feature` were updated to create isolated test targets (`container-integration`, `cookie-integration`) with `containerName` matching the test container, package via `package:target`, and deploy via the generated `deploy.sh`. The previous flow used `prepare:container` + `install-prepared-container-target`.

### SSH deployment test

`tests/integration/ssh-deployment.feature` was updated to use `package:target` + `sh deploy/ssh-integration/deploy.sh` with `ASSOCIATIVE_SURVEY_SSH_CONFIG` pointing to the test SSH config. The target now uses `sshTarget: "ssh-v3-test"` and the SSH config is written with that alias. The previous flow used `install-vps-over-ssh.ts` with the same SSH-config environment variable.

### test-visual.sh

`scripts/test-visual.sh` now creates a `targets/visual-test` target pointing at the `visual-showcase` survey, packages it, deploys via `deploy.sh`, and seeds showcase answers via `docker exec` after deployment. The previous flow used `prepare:visual` which seeded answers before the container started.

Port changed from sample target port (18080) to 18083 to avoid conflicts. Verify this is a free port in the test environment.

### GNU tar requirement

The v3 tarball uses absolute entry paths (`/app/surveys/...`) extracted via `tar xPzvf -`. BusyBox tar (default in Alpine) does not support `-P`. The main `Dockerfile` and SSH test Dockerfile have been updated to install GNU tar via `apk add tar`. Container images need to be rebuilt after this change.

### test-container.sh and test-ssh-deployment.sh

Both updated to create isolated targets, use `package:target`, and run the generated `deploy.sh`. The SSH script removes `~` from target paths (now uses relative paths `web-root/surveys` etc. without tilde).
