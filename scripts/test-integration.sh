#!/usr/bin/env bash
set -euo pipefail

IMAGE_TAG="associative-survey:integration"
CONTAINER_NAME="associative-survey-integration"

npm run build
npm run prepare:container

PORT="$(node --import tsx src/cli/read-target-survey-field.ts sample survey port)"
SURVEY_URL="$(node --import tsx src/cli/read-target-survey-field.ts sample survey publicUrl)"
SAVE_URL="$(node --import tsx src/cli/read-target-survey-field.ts sample survey saveUrl)"
REPORT_URL="$(node --import tsx src/cli/read-target-survey-field.ts sample survey reportUrl)"

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
