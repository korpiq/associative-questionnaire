FROM node:20-alpine

WORKDIR /opt/associative-survey/app

RUN apk add --no-cache busybox-extras

COPY package.json package-lock.json tsconfig.json ./
COPY src ./src
COPY docs ./docs
COPY deploy ./deploy

RUN npm ci
RUN npm run build
RUN npm run prepare:container

RUN mkdir -p /home/app/.local/share/associative-survey/surveys /home/app/.local/share/associative-survey/answers
RUN cp deploy/generated/runtime/surveys/*.json /home/app/.local/share/associative-survey/surveys/

ENV HOME=/home/app
EXPOSE 8080

CMD ["httpd", "-f", "-p", "8080", "-h", "/opt/associative-survey/app/deploy/generated/public"]
