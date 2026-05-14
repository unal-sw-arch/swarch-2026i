CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    approval_status VARCHAR(30) NOT NULL DEFAULT 'APPROVED',
    phone VARCHAR(20),
    bio TEXT,
    profile_image_url VARCHAR(500),
    address TEXT,
    government_id VARCHAR(100),
    invite_token VARCHAR(255) UNIQUE,
    invite_token_expiry TIMESTAMP,
    invited_restaurant_id BIGINT,
    reset_token VARCHAR(255),
    reset_token_expiry TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_approval_status ON users(approval_status);
CREATE INDEX IF NOT EXISTS idx_users_invite_token ON users(invite_token);
