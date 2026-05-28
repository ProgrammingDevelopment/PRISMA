FROM node:18-alpine
RUN apk add --no-cache curl
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN mkdir -p data
EXPOSE 4002
CMD ["node", "index.js"]
