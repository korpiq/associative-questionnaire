#!/usr/bin/env bash
set -euo pipefail

IMAGE_TAG="associative-survey:integration"
CONTAINER_NAME="associative-survey-integration"
PORT="18081"

npm run build
npm run prepare:container

docker build -t "${IMAGE_TAG}" .

cleanup() {
  docker rm -f "${CONTAINER_NAME}" >/dev/null 2>&1 || true
}

wait_for_contains() {
  local url="$1"
  local expected="$2"
  local attempt=0

  until curl --fail --silent "$url" | grep "$expected" >/dev/null; do
    attempt=$((attempt + 1))

    if [ "${attempt}" -ge 15 ]; then
      return 1
    fi

    sleep 1
  done
}

trap cleanup EXIT

cleanup
docker run -d --name "${CONTAINER_NAME}" -p "${PORT}:8080" "${IMAGE_TAG}" >/dev/null

wait_for_contains "http://127.0.0.1:${PORT}/surveys/survey.html" "Associative survey example"
wait_for_contains "http://127.0.0.1:${PORT}/surveys/override-survey.html" "Snippet override example"

wait_for_contains "http://127.0.0.1:${PORT}/cgi-bin/report-survey.js?surveyName=survey" "Respondents: 0"
wait_for_contains "http://127.0.0.1:${PORT}/cgi-bin/report-survey.js?surveyName=override-survey" "Respondents: 0"

curl --fail --silent --show-error \
  -X POST \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data 'favorite-color=blue&notes=First+survey+note&matches=%5B%7B%22left%22%3A%221%22%2C%22right%22%3A%22A%22%7D%5D' \
  "http://127.0.0.1:${PORT}/cgi-bin/save-survey.js?surveyName=survey" | grep "Survey saved" >/dev/null

wait_for_contains "http://127.0.0.1:${PORT}/cgi-bin/report-survey.js?surveyName=survey" "Respondents: 1"
wait_for_contains "http://127.0.0.1:${PORT}/cgi-bin/report-survey.js?surveyName=override-survey" "Respondents: 0"

curl --fail --silent --show-error \
  -X POST \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data 'favorite-color=red&notes=Second+survey+note&matches=%5B%7B%22left%22%3A%221%22%2C%22right%22%3A%22A%22%7D%5D' \
  "http://127.0.0.1:${PORT}/cgi-bin/save-survey.js?surveyName=survey" | grep "Survey saved" >/dev/null

wait_for_contains "http://127.0.0.1:${PORT}/cgi-bin/report-survey.js?surveyName=survey" "Respondents: 2"

curl --fail --silent --show-error \
  -X POST \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data 'favorite-color=blue&notes=First+override+note&matches=%5B%7B%22left%22%3A%221%22%2C%22right%22%3A%22A%22%7D%5D' \
  "http://127.0.0.1:${PORT}/cgi-bin/save-survey.js?surveyName=override-survey" | grep "Survey saved" >/dev/null

wait_for_contains "http://127.0.0.1:${PORT}/cgi-bin/report-survey.js?surveyName=override-survey" "Respondents: 1"

curl --fail --silent --show-error \
  -X POST \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data 'favorite-color=red&notes=Second+override+note&matches=%5B%7B%22left%22%3A%221%22%2C%22right%22%3A%22A%22%7D%5D' \
  "http://127.0.0.1:${PORT}/cgi-bin/save-survey.js?surveyName=override-survey" | grep "Survey saved" >/dev/null

wait_for_contains "http://127.0.0.1:${PORT}/cgi-bin/report-survey.js?surveyName=override-survey" "Respondents: 2"
