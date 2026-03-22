-- SOLO PARA DESARROLLO — datos de prueba
-- 3 usuarios
INSERT INTO users (id, email, name, google_id) 
VALUES 
  (1, 'laura@test.com', 'Laura', 'google-laura-123'),
  (2, 'juan@test.com', 'Juan', 'google-juan-123'),
  (3, 'jeronimo@test.com', 'Jeronimo', 'google-jero-123')
ON CONFLICT DO NOTHING;

-- 1 sala creada por Juan
INSERT INTO rooms (id, name, invite_code, invite_link, created_by)
VALUES (1, 'Sala Test', 'ABC123', 'http://localhost/join/ABC123', 2)
ON CONFLICT DO NOTHING;

-- los 3 como miembros de la sala
INSERT INTO room_members (room_id, user_id)
VALUES (1, 1), (1, 2), (1, 3)
ON CONFLICT DO NOTHING;

-- balance de monedas iniciales
INSERT INTO user_coins (user_id, balance)
VALUES (1, 0), (2, 0), (3, 0)
ON CONFLICT DO NOTHING;

INSERT INTO room_coins (room_id, balance)
VALUES (1, 0)
ON CONFLICT DO NOTHING;