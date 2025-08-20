# frontend/Dockerfile
FROM node:20 as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
ENV NODE_ENV=production
RUN npm run build

EXPOSE 4000
EXPOSE 4001
CMD [ "npm", "run", "start" ]