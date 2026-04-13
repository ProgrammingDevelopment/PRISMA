FROM node:18-alpine
RUN apk add --no-cache python3 make g++ curl
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN mkdir -p data
EXPOSE 4001
CMD ["node", "index.js"]
