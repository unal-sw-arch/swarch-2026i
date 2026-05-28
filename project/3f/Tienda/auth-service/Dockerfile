FROM gcc:latest

ENV DEBIAN_FRONTEND=noninteractive

# 2. Instalar herramientas base (Agregamos git para bajar la librería)
RUN apt-get update && apt-get install -y \
    cmake \
    git \
    libasio-dev \
    libssl-dev \
    libpq-dev \
    libpqxx-dev \
    && rm -rf /var/lib/apt/lists/*

# 3. COMPILAR LIBBCRYPT DESDE FUENTE (La solución al error)
# Bajamos la librería, la compilamos e instalamos en el sistema
RUN git clone https://github.com/rg3/libbcrypt.git /tmp/libbcrypt && \
    cd /tmp/libbcrypt && \
    # Esta librería es tan ligera que solo necesita 'make'
    make && \
    # Copiamos manualmente los archivos al sistema para que C++ los encuentre
    cp bcrypt.h /usr/local/include/ && \
    cp bcrypt.a /usr/local/lib/libbcrypt.a && \
    rm -rf /tmp/libbcrypt

# 4. Configurar el directorio de trabajo
WORKDIR /app

# 5. Copiar tu código
COPY . .

# 6. Compilar tu microservicio
RUN mkdir -p build && cd build && \
    cmake .. && \
    make

# 7. Exponer y ejecutar
EXPOSE 8080
CMD ["./build/auth_service"]