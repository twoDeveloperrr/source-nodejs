FROM node:latest

RUN mkdir -p /app

WORKDIR /app

ADD . /app

RUN npm install

EXPOSE 3000 80

CMD node index.js
