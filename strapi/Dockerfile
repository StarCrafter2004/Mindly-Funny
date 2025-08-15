# strapi/Dockerfile
FROM node:20


WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
ENV NODE_ENV=production

EXPOSE 1337

RUN npm run build --verbose
CMD [ "npm", "run", "start" ]
