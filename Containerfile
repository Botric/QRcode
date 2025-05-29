FROM node:14

# Install system dependencies for canvas (required by the 'canvas' package)
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       libcairo2-dev libjpeg-dev libpango1.0-dev libgif-dev build-essential pkg-config \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY ./src ./src
COPY ./public ./public

EXPOSE 5610

CMD ["node", "src/app.js"]