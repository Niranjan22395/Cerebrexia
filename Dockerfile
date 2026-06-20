# Multi-stage build for Cerebrexia Event Management Platform

# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./
RUN npm install

# Copy frontend source (including .env file)
COPY frontend/ ./

# Build argument for Google Client ID
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_API_URL=http://localhost:5000/api/v1
ARG VITE_APP_ENV=development

# Set environment variables for build
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_APP_ENV=$VITE_APP_ENV

# Build frontend (environment variables will be embedded)
RUN npm run build

# Stage 2: Production
FROM node:18-alpine
WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./
RUN npm install

# Copy backend source (no build, run TypeScript directly with ts-node)
COPY backend/src ./src
COPY backend/tsconfig.json ./

# Copy built frontend to serve from backend
COPY --from=frontend-build /app/frontend/dist ./public

# Create uploads directory
RUN mkdir -p uploads

# Expose port 5000
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=development
ENV PORT=5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application with explicit logging
CMD ["sh", "-c", "echo 'Starting Cerebrexia...' && echo 'Node version:' && node --version && echo 'Starting ts-node...' && npx ts-node --transpile-only src/index.ts 2>&1"]

# Made with Bob
