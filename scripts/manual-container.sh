#!/usr/bin/env bash
set -euo pipefail

IMAGE_TAG="associative-survey:test"
CONTAINER_NAME="associative-survey-manual"

npm run build
npm run prepare:container

PORT="$(node --import tsx src/cli/read-target-survey-field.ts sample survey port)"
SURVEY_URL="$(node --import tsx src/cli/read-target-survey-field.ts sample survey publicUrl)"
REPORT_URL="$(node --import tsx src/cli/read-target-survey-field.ts sample survey reportUrl)"

docker build -t "${IMAGE_TAG}" .
docker rm -f "${CONTAINER_NAME}" >/dev/null 2>&1 || true
docker run -d --name "${CONTAINER_NAME}" -p "${PORT}:8080" "${IMAGE_TAG}" >/dev/null

cat <<EOF
Container is running.

Survey:
${SURVEY_URL}

Report:
${REPORT_URL}

Stop it with:
docker rm -f ${CONTAINER_NAME}
EOF
