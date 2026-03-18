#!/usr/bin/env bash
set -euo pipefail

IMAGE_TAG="associative-survey:visual"
CONTAINER_NAME="associative-survey-visual"
PORT="18082"

cleanup() {
  docker rm -f "${CONTAINER_NAME}" >/dev/null 2>&1 || true
}

wait_for_contains() {
  local url="$1"
  local expected="$2"
  local attempt=0

  until curl --fail --silent "$url" | grep "$expected" >/dev/null; do
    attempt=$((attempt + 1))

    if [ "${attempt}" -ge 20 ]; then
      return 1
    fi

    sleep 1
  done
}

trap cleanup EXIT

npm run build

docker build --build-arg PREPARE_COMMAND=prepare:visual -t "${IMAGE_TAG}" .

cleanup
docker run -d --name "${CONTAINER_NAME}" -p "${PORT}:8080" "${IMAGE_TAG}" >/dev/null

wait_for_contains "http://127.0.0.1:${PORT}/surveys/visual-showcase.html" "Correctness showcase"
wait_for_contains "http://127.0.0.1:${PORT}/cgi-bin/report-survey.js?surveyName=visual-showcase" "Correct: 2 (66.66666666666666%)"
wait_for_contains "http://127.0.0.1:${PORT}/cgi-bin/report-survey.js?surveyName=visual-showcase" "Incorrect: 1 (33.33333333333333%)"

echo "Visual showcase container is running."
echo "Survey: http://127.0.0.1:${PORT}/surveys/visual-showcase.html"
echo "Report: http://127.0.0.1:${PORT}/cgi-bin/report-survey.js?surveyName=visual-showcase"
echo "Stop it with: docker rm -f ${CONTAINER_NAME}"

trap - EXIT
