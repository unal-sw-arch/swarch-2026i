-- Crear el tipo Enum para los roles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'userrole') THEN
        CREATE TYPE userrole AS ENUM ('CUSTOMER', 'RESTAURANT');
    END IF;
END$$;

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role userrole NOT NULL
);

-- Tabla de Vinculación de Restaurantes
CREATE TABLE IF NOT EXISTS restaurant_users (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    restaurant_id INTEGER NOT NULL
);

-- Crear índices
CREATE INDEX IF NOT EXISTS ix_users_email ON users(email);
