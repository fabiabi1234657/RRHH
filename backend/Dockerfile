FROM node:20-alpine

WORKDIR /app

# Copiar manifiestos primero (aprovecha cache de capas)
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production

# Copiar el resto del código fuente
COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
