FROM arm64v8/node:20-alpine as builder

WORKDIR /app
COPY package.json .
COPY tsconfig.json .
COPY .npmrc .
COPY src ./src
RUN npm i -g npm@latest
RUN npm ci && npm run build

FROM arm64v8/node:20-alpine
WORKDIR /app
RUN apk add --no-cache curl
COPY tsconfig.json .
COPY .npmrc .
RUN npm i -g pm2 npm@latest
RUN npm ci --production
COPY --from=builder /app/build ./build
EXPOSE 4002
CMD [ "npm", "run", "start" ]
