#!/usr/bin/env bash
set -euo pipefail

IMAGE_TAG="associative-survey:test"
CONTAINER_NAME="associative-survey-manual"
PORT="18080"

npm run build
npm run prepare:container

docker build -t "${IMAGE_TAG}" .
docker rm -f "${CONTAINER_NAME}" >/dev/null 2>&1 || true
docker run -d --name "${CONTAINER_NAME}" -p "${PORT}:8080" "${IMAGE_TAG}" >/dev/null

cat <<EOF
Container is running.

Survey:
http://127.0.0.1:${PORT}/surveys/survey/

Report:
http://127.0.0.1:${PORT}/cgi-bin/survey/report.cgi

Stop it with:
docker rm -f ${CONTAINER_NAME}
EOF
