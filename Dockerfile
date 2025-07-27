FROM node:20-slim

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# RUN npm test

EXPOSE 3000

CMD ["npm", "run", "start"]