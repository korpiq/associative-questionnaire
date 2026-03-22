#!/usr/bin/env bash
set -euo pipefail

. scripts/lib/target-survey-urls.sh

IMAGE_TAG="associative-survey:integration"
CONTAINER_NAME="associative-survey-integration"

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
}

trap cleanup EXIT

cleanup
docker run -d --name "${CONTAINER_NAME}" -p "${PORT}:8080" "${IMAGE_TAG}" >/dev/null
sleep 2

curl --fail --silent "${SURVEY_URL}" | grep "Associative survey example" >/dev/null
curl --fail --silent "${REPORT_URL}" | grep "Respondents: 0" >/dev/null

curl --fail --silent --show-error \
  -X POST \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -H 'Cookie: associativeSurveyRespondentId=11111111111111111111111111111111' \
  --data 'favorite-color=blue&notes=First+survey+note&matches=%5B%7B%22left%22%3A%221%22%2C%22right%22%3A%22A%22%7D%5D' \
  "${SAVE_URL}" | grep "Survey saved" >/dev/null

curl --fail --silent "${REPORT_URL}" | grep "Respondents: 1" >/dev/null
