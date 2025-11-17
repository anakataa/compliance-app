# Build app
FROM node:18 AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci
COPY . .

RUN npm run build

# Execution mode
FROM node:18-slim

WORKDIR /app

COPY --from=build /app/dist /app/dist
COPY --from=build /app/node_modules /app/node_modules

USER node

LABEL owner="mendex" version="1.0.0"

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl --silent --fail localhost:3000/health || exit 1

CMD ["node", "dist/main.js"]
