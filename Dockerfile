FROM node:16-buster-slim as base
WORKDIR /service

FROM base as dependencies
COPY package.json yarn.lock tsconfig.json ./
RUN yarn --pure-lockfile --ignore-engines --production true

FROM dependencies as build
RUN yarn --pure-lockfile --ignore-engines --production false
COPY . ./
RUN yarn build

FROM base as release
COPY --from=build /service/node_modules ./node_modules
COPY --from=build /service/package.json ./package.json
COPY --from=build /service/build ./build

ENV NODE_ENV=production

CMD yarn start