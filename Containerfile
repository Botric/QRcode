FROM node:18-bookworm-slim AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY ./src ./src
COPY ./public ./public
COPY ./vite.config.js ./vite.config.js

RUN npm run build:web


FROM node:18-bookworm-slim

RUN apt-get update \
     && apt-get install -y --no-install-recommends \
         curl \
     && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=build /usr/src/app/src ./src
COPY --from=build /usr/src/app/public ./public
COPY --from=build /usr/src/app/dist ./dist

EXPOSE 5610

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD curl -fsS http://localhost:5610/health || exit 1

CMD ["node", "src/app.js"]