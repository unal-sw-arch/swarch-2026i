FROM node:20-alpine

# directorio de trabajo dentro del contenedor
WORKDIR /app

# copiar package.json primero para aprovechar cache de Docker
# si no cambian las dependencias, no reinstala en cada build
COPY package*.json ./

# instalar dependencias
RUN npm install --production

# copiar el resto del código
COPY . .

# exponer el puerto
EXPOSE 8001

# comando para iniciar el servicio
CMD ["node", "src/index.js"]