#!/usr/bin/env bash
set -euo pipefail

. scripts/lib/target-survey-urls.sh

IMAGE_TAG="associative-survey:test"
CONTAINER_NAME="associative-survey-test"
TARGET_NAME="container-integration"
TARGET_DIR="targets/${TARGET_NAME}"

npm run build

# create a test-specific target so containerName matches the test container
rm -rf "${TARGET_DIR}"
mkdir -p "${TARGET_DIR}/surveys"
cp -R targets/sample/surveys/survey "${TARGET_DIR}/surveys/"
cat > "${TARGET_DIR}/target.json" <<EOF
{
  "type": "container",
  "containerName": "${CONTAINER_NAME}",
  "publicDir": "/srv/www/surveys",
  "cgiDir": "/srv/www/cgi-bin",
  "dataDir": "/srv/www/data",
  "baseUrl": "http://127.0.0.1",
  "port": 18080,
  "staticUriPath": "/surveys",
  "cgiUriPath": "/cgi-bin",
  "nodeExecutable": "/usr/local/bin/node",
  "cgiExtension": ".cgi"
}
EOF

npm run package:target -- "${TARGET_DIR}"

load_target_survey_urls "${TARGET_NAME}" survey
PORT="${TARGET_SURVEY_PORT}"
SURVEY_URL="${TARGET_SURVEY_PUBLIC_URL}"
SAVE_URL="${TARGET_SURVEY_SAVE_URL}"
REPORT_URL="${TARGET_SURVEY_REPORT_URL}"

docker build -t "${IMAGE_TAG}" .

cleanup_container() {
  docker rm -f "${CONTAINER_NAME}" >/dev/null 2>&1 || true
  docker rm -f associative-survey-debug >/dev/null 2>&1 || true
}

cleanup() {
  cleanup_container
  rm -rf "${TARGET_DIR}" "deploy/${TARGET_NAME}"
}

trap cleanup EXIT

cleanup_container
docker run -d --name "${CONTAINER_NAME}" -p "${PORT}:8080" "${IMAGE_TAG}" >/dev/null
sh "deploy/${TARGET_NAME}/deploy.sh"
sleep 2

curl --fail --silent "${SURVEY_URL}" | grep "Submit survey" >/dev/null

curl --fail --silent --show-error \
  -X POST \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data 'favorite-color=blue&notes=Container+note&matches=%5B%7B%22left%22%3A%221%22%2C%22right%22%3A%22A%22%7D%5D' \
  "${SAVE_URL}" | grep "Survey saved" >/dev/null

curl --fail --silent "${REPORT_URL}" | grep "Respondents: 1" >/dev/null
