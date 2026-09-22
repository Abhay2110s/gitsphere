# Multi-stage Dockerfile for GitSphere Node.js Backend
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies first for efficient layer caching
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source
COPY . .

# Ensure uploads directory exists
RUN mkdir -p uploads

# Expose default port
EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

# Start server
CMD ["node", "src/server.js"]
