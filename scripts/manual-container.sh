#!/usr/bin/env bash
set -euo pipefail

. scripts/lib/target-survey-urls.sh

IMAGE_TAG="associative-survey:test"
CONTAINER_NAME="associative-survey-manual"

npm run build
npm run prepare:container

load_target_survey_urls sample survey
PORT="${TARGET_SURVEY_PORT}"
SURVEY_URL="${TARGET_SURVEY_PUBLIC_URL}"
REPORT_URL="${TARGET_SURVEY_REPORT_URL}"

docker build -t "${IMAGE_TAG}" .
docker rm -f "${CONTAINER_NAME}" >/dev/null 2>&1 || true
docker run -d --name "${CONTAINER_NAME}" -p "${PORT}:8080" "${IMAGE_TAG}" >/dev/null
node --import tsx src/cli/install-prepared-container-target.ts sample --container-name "${CONTAINER_NAME}"

cat <<EOF
Container is running.

Survey:
${SURVEY_URL}

Report:
${REPORT_URL}

Stop it with:
docker rm -f ${CONTAINER_NAME}
EOF
