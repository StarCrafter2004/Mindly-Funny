# strapi/Dockerfile
FROM node:22


WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
ENV NODE_ENV=production

EXPOSE 1337
ENV NODE_OPTIONS="--max-old-space-size=1024"
RUN npm run build
CMD [ "npm", "run", "start" ]
