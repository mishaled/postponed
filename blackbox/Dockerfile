FROM node:16-buster-slim as base

WORKDIR /service

COPY package.json yarn.lock ./
RUN yarn --pure-lockfile

COPY . .

ARG ENV
ENV ENV=${ENV}

CMD yarn test:run
