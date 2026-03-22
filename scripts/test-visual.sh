#!/usr/bin/env bash
set -euo pipefail

. scripts/lib/target-survey-urls.sh

IMAGE_TAG="associative-survey:visual"
CONTAINER_NAME="associative-survey-visual"

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
npm run prepare:visual

load_target_survey_urls sample visual-showcase VISUAL_SURVEY
PORT="${VISUAL_SURVEY_PORT}"
SURVEY_URL="${VISUAL_SURVEY_PUBLIC_URL}"
REPORT_URL="${VISUAL_SURVEY_REPORT_URL}"

docker build -t "${IMAGE_TAG}" .

cleanup
docker run -d --name "${CONTAINER_NAME}" -p "${PORT}:8080" "${IMAGE_TAG}" >/dev/null

wait_for_contains "${SURVEY_URL}" "Correctness showcase"
wait_for_contains "${REPORT_URL}" "Correct: 2 (66.66666666666666%)"
wait_for_contains "${REPORT_URL}" "Incorrect: 1 (33.33333333333333%)"

echo "Visual showcase smoke check passed."
echo "Visual showcase container is running."
echo "Survey: ${SURVEY_URL}"
echo "Report: ${REPORT_URL}"
echo "Stop it with: docker rm -f ${CONTAINER_NAME}"

trap - EXIT
