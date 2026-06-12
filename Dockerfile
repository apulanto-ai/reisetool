# ---------- Build ----------
FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

# ---------- Runtime ----------
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production \
    DATABASE_URL=/data/reisetool.db \
    MIGRATIONS_DIR=/app/drizzle \
    PORT=3000

COPY --from=build /app/build ./build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/drizzle ./drizzle

EXPOSE 3000
VOLUME /data
CMD ["node", "build"]
