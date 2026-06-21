-- 1. Crear la tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);


-- Admin inicial del sistema.
-- Credenciales: gonzalezsierrajuandaiel10@gmail.com / Admin123
-- El ON CONFLICT DO UPDATE asegura que si el correo ya existe (por un
-- registro previo desde la UI o una semilla vieja), quede como admin.
INSERT INTO users (username, email, password_hash, role)
VALUES (
    'admin_root',
    'gonzalezsierrajuandaiel10@gmail.com',
    '$2b$12$wKHPUmZ4uhlL2Y7xI4DxuumKkAoujUI0dtmkY3LhfNGW8.BWopiJO',
    1
)
ON CONFLICT (email) DO UPDATE SET role = 1;