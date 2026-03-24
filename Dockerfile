FROM node:20-alpine

RUN apk add --no-cache busybox-extras tar
RUN mkdir -p /srv/www

ENV HOME=/home/app
EXPOSE 8080

CMD ["httpd", "-f", "-p", "8080", "-h", "/srv/www"]
