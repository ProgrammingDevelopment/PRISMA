FROM node:18-alpine
RUN apk add --no-cache curl
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 4005
CMD ["node", "index.js"]
