FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runtime
RUN apk add --no-cache openssl
RUN mkdir -p /etc/nginx/certs \
	&& openssl req -x509 -nodes -newkey rsa:2048 \
	-keyout /etc/nginx/certs/localhost.key \
	-out /etc/nginx/certs/localhost.crt \
	-days 3650 \
	-subj "/C=CO/ST=Cundinamarca/L=Bogota/O=Planio/OU=Frontend/CN=localhost"
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
