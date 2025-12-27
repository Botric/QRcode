FROM node:18-bookworm-slim

RUN apt-get update \
     && apt-get install -y --no-install-recommends \
         curl \
     && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --omit=dev

COPY ./src ./src
COPY ./public ./public

EXPOSE 5610

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD curl -fsS http://localhost:5610/health || exit 1

CMD ["node", "src/app.js"]