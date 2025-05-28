FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY ./src ./src
COPY ./public ./public

EXPOSE 5610

CMD ["node", "src/app.js"]