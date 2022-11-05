FROM node:18-slim

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile --production

COPY . ./

RUN yarn build

RUN rm -rf src

CMD [ "npm", "start" ]