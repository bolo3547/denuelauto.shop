### Root backend Dockerfile for Denuel Auto
### Multi-stage build: install -> build -> runtime
FROM node:18-alpine AS build
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json tsconfig.json tsconfig.build.json ./
COPY src ./src
COPY prisma ./prisma
RUN npm ci --silent
RUN npm run build

FROM node:18-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
RUN npm ci --only=production --silent
RUN apk add --no-cache curl
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD curl -sS --fail http://localhost:4000/api/health || exit 1
CMD ["node", "dist/server.js"]
