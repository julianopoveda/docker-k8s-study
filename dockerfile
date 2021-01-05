#diversos estagios

FROM alpine

RUN apk add bash

RUN apk add curl

RUN apk add  --no-cache --repository http://dl-cdn.alpinelinux.org/alpine/v3.9/main/ nodejs=12.18.4-r0

RUN apk add npm

WORKDIR /app

COPY app .

RUN npm install

CMD [ "node", "server.js" ]