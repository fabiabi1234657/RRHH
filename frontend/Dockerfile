# Etapa 1: build de React
FROM node:24-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY --chown=node:node . .
RUN chown node:node /app
USER node
RUN npm run build

# Etapa 2: servir con Node bajo usuario no-root
FROM node:24-alpine

WORKDIR /app

COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node server.mjs ./

ENV PORT=8080
ENV BACKEND_URL=http://backend:5000

EXPOSE 8080

USER node

CMD ["node", "server.mjs"]
