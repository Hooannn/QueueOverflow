FROM node:18-alpine AS development

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

CMD ["npm", "run", "listen:dev"]


FROM node:18-alpine AS production

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build

CMD ["npm", "run", "listen"]