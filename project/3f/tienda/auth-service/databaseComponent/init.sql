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


INSERT INTO users (username, email, password_hash, role)
VALUES (
    'admin_root', 
    'juanda.gonzalezs10@gmail.com', 
    '$2a$12$tp/Vj6lVLOge3nxZquVtweg3UPg1aCYIFzecJq4LM3nFOgcaQ.Cbm', 
    1
) 
ON CONFLICT (email) DO NOTHING;