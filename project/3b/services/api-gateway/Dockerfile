FROM node:22-slim

WORKDIR /app

COPY package*.json ./
RUN npm install --quiet --no-audit --no-fund

COPY src ./src

EXPOSE 4000

CMD ["npm", "start"]
