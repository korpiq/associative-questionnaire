#!/usr/bin/env bash
set -euo pipefail

. scripts/lib/target-survey-urls.sh

HOST_IMAGE="associative-survey:ssh-host"
HOST_CONTAINER="associative-survey-ssh-host"
TARGET_NAME="ssh-integration"
SSH_PORT="2222"
HTTP_PORT="18082"
TEST_ROOT="$(pwd)/.test-ssh-deployment"
TARGET_DIRECTORY="$(pwd)/targets/${TARGET_NAME}"

cleanup() {
  docker rm -f "${HOST_CONTAINER}" >/dev/null 2>&1 || true
  rm -rf "${TEST_ROOT}"
  rm -rf "${TARGET_DIRECTORY}"
  rm -rf "deploy/${TARGET_NAME}"
}

trap cleanup EXIT

cleanup

mkdir -p "${TEST_ROOT}/keys" "${TEST_ROOT}/home/.ssh" "${TARGET_DIRECTORY}/surveys"
cp -R targets/sample/surveys/survey "${TARGET_DIRECTORY}/surveys/"

cat > "${TARGET_DIRECTORY}/target.json" <<EOF
{
  "type": "ssh",
  "sshTarget": "ssh-v3-test",
  "publicDir": "web-root/surveys",
  "cgiDir": "web-root/cgi-bin",
  "dataDir": "private-data",
  "baseUrl": "http://127.0.0.1",
  "port": ${HTTP_PORT},
  "staticUriPath": "/surveys",
  "cgiUriPath": "/cgi-bin",
  "nodeExecutable": "/usr/local/bin/node",
  "cgiExtension": ".cgi"
}
EOF

load_target_survey_urls "${TARGET_NAME}" survey SSH_SURVEY
SURVEY_URL="${SSH_SURVEY_PUBLIC_URL}"
SAVE_URL="${SSH_SURVEY_SAVE_URL}"
REPORT_URL="${SSH_SURVEY_REPORT_URL}"

ssh-keygen -q -t ed25519 -N '' -f "${TEST_ROOT}/keys/id_ed25519" >/dev/null
chmod 700 "${TEST_ROOT}/home/.ssh"

cat > "${TEST_ROOT}/home/.ssh/config" <<EOF
Host ssh-v3-test
  HostName 127.0.0.1
  Port ${SSH_PORT}
  User root
  IdentityFile ${TEST_ROOT}/keys/id_ed25519
  StrictHostKeyChecking no
  UserKnownHostsFile /dev/null
EOF

chmod 600 "${TEST_ROOT}/home/.ssh/config"
cp "${TEST_ROOT}/keys/id_ed25519.pub" "${TEST_ROOT}/authorized_keys"

cat > "${TEST_ROOT}/Dockerfile" <<'EOF'
FROM node:20-alpine

RUN apk add --no-cache openssh-server busybox-extras tar
RUN mkdir -p /root/.ssh /root/web-root/surveys /root/web-root/cgi-bin /root/private-data /var/run/sshd
COPY authorized_keys /root/.ssh/authorized_keys
RUN chmod 700 /root/.ssh \
  && chmod 600 /root/.ssh/authorized_keys
RUN ssh-keygen -A
RUN printf '%s\n' \
  'PasswordAuthentication no' \
  'PermitRootLogin yes' \
  'PubkeyAuthentication yes' \
  'AuthorizedKeysFile .ssh/authorized_keys' \
  > /etc/ssh/sshd_config.d/test.conf

EXPOSE 22 8080

CMD ["/bin/sh", "-lc", "/usr/sbin/sshd && exec httpd -f -p 8080 -h /root/web-root"]
EOF

docker build -t "${HOST_IMAGE}" "${TEST_ROOT}" >/dev/null
docker run -d --name "${HOST_CONTAINER}" -p "${HTTP_PORT}:8080" -p "${SSH_PORT}:22" "${HOST_IMAGE}" >/dev/null
sleep 2

npm run package:target -- "targets/${TARGET_NAME}"
HOME="${TEST_ROOT}/home" sh "deploy/${TARGET_NAME}/deploy.sh"

curl --fail --silent "${SURVEY_URL}" | grep "Associative survey example" >/dev/null
echo "survey page ok"
curl --fail --silent --show-error \
  -X POST \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -H 'Cookie: associativeSurveyRespondentId=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' \
  --data 'favorite-color=blue&notes=SSH+note&matches=%5B%7B%22left%22%3A%221%22%2C%22right%22%3A%22A%22%7D%5D' \
  "${SAVE_URL}" | grep "Survey saved" >/dev/null
echo "save ok"
curl --fail --silent "${REPORT_URL}" | grep "Respondents: 1" >/dev/null
echo "report ok"

docker exec "${HOST_CONTAINER}" test -f /root/web-root/surveys/survey/index.html
echo "public file ok"
docker exec "${HOST_CONTAINER}" test -f /root/web-root/cgi-bin/survey/save.cgi
echo "cgi file ok"
docker exec "${HOST_CONTAINER}" test -f /root/private-data/survey/survey.json
echo "private file ok"
