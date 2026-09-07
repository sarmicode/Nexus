FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN mkdir -p uploads/listings
EXPOSE 5000
CMD ["node", "src/server.js"]
