FROM node:24-alpine

WORKDIR /app

# Copiar manifiestos primero (aprovecha cache de capas)
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --omit=dev

# Copiar el resto del código fuente
COPY --chown=node:node . .

RUN mkdir -p uploads && chown -R node:node /app

EXPOSE 5000

USER node

CMD ["node", "server.js"]
