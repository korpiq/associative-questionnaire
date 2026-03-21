FROM node:20-alpine

RUN apk add --no-cache busybox-extras

COPY deploy/generated/container-image.tar.gz /tmp/deployable-container.tar.gz
RUN tar -xzf /tmp/deployable-container.tar.gz -C / && rm /tmp/deployable-container.tar.gz

ENV HOME=/home/app
EXPOSE 8080

CMD ["httpd", "-f", "-p", "8080", "-h", "/srv/www"]
