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

wait_for_report_contains() {
  wait_for_contains "${REPORT_URL}" "$1"
}

extract_form_action() {
  local survey_url="$1"
  local survey_html

  survey_html="$(curl --fail --silent "${survey_url}")"
  printf '%s' "${survey_html}" \
    | tr '\n' ' ' \
    | sed -n 's/.*action="\([^"]*\)".*/\1/p' \
    | sed 's/&amp;/\&/g'
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
node --import tsx src/cli/install-prepared-container-target.ts sample \
  --container-name "${CONTAINER_NAME}" \
  --tarball-path "deploy/generated/container-image.tar.gz"

wait_for_contains "${SURVEY_URL}" "Correctness showcase"
wait_for_report_contains "Correct: 2 (66.66666666666666%)"
wait_for_report_contains "Incorrect: 1 (33.33333333333333%)"

FORM_ACTION="$(extract_form_action "${SURVEY_URL}")"

curl --fail --silent --show-error \
  -X POST \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -H 'Cookie: associativeSurveyRespondentId=visualshowcasesubmit000000000001' \
  --data 'favorite-color=blue&hobbies=music&notes=Visual+submit&matches=%5B%7B%22left%22%3A%221%22%2C%22right%22%3A%22A%22%7D%5D' \
  "${FORM_ACTION}" >/dev/null

wait_for_report_contains "Respondents: 4"

echo "Visual showcase smoke check passed."
echo "Visual showcase submit check passed."
echo "Visual showcase container is running."
echo "Survey: ${SURVEY_URL}"
echo "Report: ${REPORT_URL}"
echo "Stop it with: docker rm -f ${CONTAINER_NAME}"

trap - EXIT
