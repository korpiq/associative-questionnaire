#!/usr/bin/env bash
set -euo pipefail

IMAGE_TAG="associative-survey:test"
CONTAINER_NAME="associative-survey-test"
PORT="18080"

npm run build
npm run prepare:container

docker build -t "${IMAGE_TAG}" .

cleanup() {
  docker rm -f "${CONTAINER_NAME}" >/dev/null 2>&1 || true
  docker rm -f associative-survey-debug >/dev/null 2>&1 || true
}

trap cleanup EXIT

cleanup
docker run -d --name "${CONTAINER_NAME}" -p "${PORT}:8080" "${IMAGE_TAG}" >/dev/null
sleep 2

curl --fail --silent "http://127.0.0.1:${PORT}/surveys/survey/" | grep "Submit survey" >/dev/null

curl --fail --silent --show-error \
  -X POST \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data 'favorite-color=blue&notes=Container+note&matches=%5B%7B%22left%22%3A%221%22%2C%22right%22%3A%22A%22%7D%5D' \
  "http://127.0.0.1:${PORT}/cgi-bin/survey/save.cgi" | grep "Survey saved" >/dev/null

curl --fail --silent "http://127.0.0.1:${PORT}/cgi-bin/survey/report.cgi" | grep "Respondents: 1" >/dev/null
