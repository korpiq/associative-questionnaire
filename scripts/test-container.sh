#!/usr/bin/env bash
set -euo pipefail

. scripts/lib/target-survey-urls.sh

IMAGE_TAG="associative-survey:test"
CONTAINER_NAME="associative-survey-test"

npm run build
npm run prepare:container

load_target_survey_urls sample survey
PORT="${TARGET_SURVEY_PORT}"
SURVEY_URL="${TARGET_SURVEY_PUBLIC_URL}"
SAVE_URL="${TARGET_SURVEY_SAVE_URL}"
REPORT_URL="${TARGET_SURVEY_REPORT_URL}"

docker build -t "${IMAGE_TAG}" .

cleanup() {
  docker rm -f "${CONTAINER_NAME}" >/dev/null 2>&1 || true
  docker rm -f associative-survey-debug >/dev/null 2>&1 || true
}

trap cleanup EXIT

cleanup
docker run -d --name "${CONTAINER_NAME}" -p "${PORT}:8080" "${IMAGE_TAG}" >/dev/null
node --import tsx src/cli/install-prepared-container-target.ts sample --container-name "${CONTAINER_NAME}"
sleep 2

curl --fail --silent "${SURVEY_URL}" | grep "Submit survey" >/dev/null

curl --fail --silent --show-error \
  -X POST \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data 'favorite-color=blue&notes=Container+note&matches=%5B%7B%22left%22%3A%221%22%2C%22right%22%3A%22A%22%7D%5D' \
  "${SAVE_URL}" | grep "Survey saved" >/dev/null

curl --fail --silent "${REPORT_URL}" | grep "Respondents: 1" >/dev/null
