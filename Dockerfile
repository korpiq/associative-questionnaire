FROM node:20-alpine

WORKDIR /opt/associative-survey/app

RUN apk add --no-cache busybox-extras

COPY package.json package-lock.json tsconfig.json ./
COPY src ./src
COPY docs ./docs
COPY deploy ./deploy
COPY targets ./targets

RUN npm ci
RUN npm run build
ARG PREPARE_COMMAND=prepare:container
ARG PREPARE_TARGET=sample
RUN npm run ${PREPARE_COMMAND} -- ${PREPARE_TARGET}
RUN node --import tsx src/cli/install-container-runtime-data.ts

ENV HOME=/home/app
EXPOSE 8080

CMD ["httpd", "-f", "-p", "8080", "-h", "/opt/associative-survey/app/deploy/generated/public"]
