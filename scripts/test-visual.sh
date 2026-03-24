#!/usr/bin/env bash
set -euo pipefail

. scripts/lib/target-survey-urls.sh

IMAGE_TAG="associative-survey:visual"
CONTAINER_NAME="associative-survey-visual"
TARGET_NAME="visual-test"
TARGET_DIR="targets/${TARGET_NAME}"

cleanup() {
  docker rm -f "${CONTAINER_NAME}" >/dev/null 2>&1 || true
  rm -rf "${TARGET_DIR}" "deploy/${TARGET_NAME}"
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

# create a visual-test target pointing to the visual-showcase survey
rm -rf "${TARGET_DIR}"
mkdir -p "${TARGET_DIR}/surveys"
cp -R targets/sample/surveys/visual-showcase "${TARGET_DIR}/surveys/"
cat > "${TARGET_DIR}/target.json" <<EOF
{
  "type": "container",
  "containerName": "${CONTAINER_NAME}",
  "publicDir": "/srv/www/surveys",
  "cgiDir": "/srv/www/cgi-bin",
  "dataDir": "/srv/www/data",
  "baseUrl": "http://127.0.0.1",
  "port": 18083,
  "staticUriPath": "/surveys",
  "cgiUriPath": "/cgi-bin",
  "nodeExecutable": "/usr/local/bin/node",
  "cgiExtension": ".cgi"
}
EOF

npm run package:target -- "${TARGET_DIR}"

load_target_survey_urls "${TARGET_NAME}" visual-showcase VISUAL_SURVEY
PORT="${VISUAL_SURVEY_PORT}"
SURVEY_URL="${VISUAL_SURVEY_PUBLIC_URL}"
REPORT_URL="${VISUAL_SURVEY_REPORT_URL}"

docker build -t "${IMAGE_TAG}" .

cleanup
docker run -d --name "${CONTAINER_NAME}" -p "${PORT}:8080" "${IMAGE_TAG}" >/dev/null
sh "deploy/${TARGET_NAME}/deploy.sh"

# seed pre-existing showcase answers into the deployed container
docker exec "${CONTAINER_NAME}" mkdir -p /srv/www/data/visual-showcase/answers
docker exec "${CONTAINER_NAME}" sh -c 'cat > /srv/www/data/visual-showcase/answers/showcase-1.json' <<'EOF'
{"surveyTitle":"Correctness showcase","answers":{"favorite-color":{"type":"single-choice","value":"blue"},"hobbies":{"type":"multi-choice","value":["music","sports"]},"notes":{"type":"free-text","value":"Calm"},"matches":{"type":"associative","value":[{"left":"1","right":"A"},{"left":"2","right":"B"}]}}}
EOF
docker exec "${CONTAINER_NAME}" sh -c 'cat > /srv/www/data/visual-showcase/answers/showcase-2.json' <<'EOF'
{"surveyTitle":"Correctness showcase","answers":{"favorite-color":{"type":"single-choice","value":"red"},"hobbies":{"type":"multi-choice","value":["music"]},"notes":{"type":"free-text","value":"Loud"},"matches":{"type":"associative","value":[{"left":"1","right":"B"}]}}}
EOF
docker exec "${CONTAINER_NAME}" sh -c 'cat > /srv/www/data/visual-showcase/answers/showcase-3.json' <<'EOF'
{"surveyTitle":"Correctness showcase","answers":{"favorite-color":{"type":"single-choice","value":"blue"},"hobbies":{"type":"multi-choice","value":["sports"]},"notes":{"type":"free-text","value":"Precise"},"matches":{"type":"associative","value":[{"left":"1","right":"A"},{"left":"2","right":"A"}]}}}
EOF

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
