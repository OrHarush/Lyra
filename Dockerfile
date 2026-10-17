FROM node:24-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY shared/package.json shared/
COPY server/package.json server/

RUN npm ci -w server

COPY shared shared/
COPY server server/

RUN npm run build:server


FROM node:24-alpine AS runtime
WORKDIR /app

COPY package.json package-lock.json ./
COPY shared/package.json shared/
COPY server/package.json server/

RUN npm ci -w server --omit=dev

COPY --from=build /app/shared/dist shared/dist
COPY --from=build /app/server/dist server/dist

ENV NODE_ENV=production
EXPOSE 5000
CMD ["node", "server/dist/server.js"]