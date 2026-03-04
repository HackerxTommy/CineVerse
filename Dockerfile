# ── Stage 1: Build the React client ──
FROM node:20-alpine AS client-build

WORKDIR /app/client

COPY client/package*.json ./
RUN npm ci

COPY client/ .

ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ── Stage 2: Production server ──
FROM node:20-alpine

WORKDIR /app

# Install server dependencies
COPY server/package*.json ./
RUN npm ci --omit=dev

# Copy server source
COPY server/ .

# Copy built client into server's public folder
COPY --from=client-build /app/client/dist ./public

EXPOSE 5000

CMD ["node", "server.js"]
