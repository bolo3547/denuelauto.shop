### Frontend Dockerfile (Next.js) for Denuel Auto
FROM node:18-alpine AS deps
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --silent

FROM node:18-alpine AS build
WORKDIR /app
COPY frontend ./
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
EXPOSE 3000
RUN apk add --no-cache curl
COPY --from=build /app/public ./public
COPY --from=build /app/.next ./.next
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD curl -sS --fail http://localhost:3000/api/health || exit 1
CMD ["npm", "start"]
