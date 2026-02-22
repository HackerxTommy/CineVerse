FROM node:20-alpine

WORKDIR /app

# Install dependencies first (cached layer)
COPY package*.json ./
RUN npm ci --production

# Copy source
COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
