# AuthService

Microservicio de autenticación e identidad para Click & Munch. Gestiona el registro, login, aprobación de usuarios y vinculación de canales de notificación externos.

---

## Responsabilidades

- Registro de usuarios (CUSTOMER, RESTAURANT_MANAGER) con auto-aprobación o aprobación de admin.
- Flujo de invitación para staff (WAITER, CHEF) mediante token de invitación.
- Generación y validación de JWT.
- Restablecimiento de contraseña por token.
- Gestión de perfil de usuario.
- Vinculación opcional de cuenta de Telegram para recibir notificaciones.

---

## Endpoints

Base interna: `/api/auth` — accesible desde el gateway en `/auth/**`.

### Autenticación

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/auth/register` | Registro de usuario (CUSTOMER o RESTAURANT_MANAGER) |
| `POST` | `/api/auth/login` | Login con username/password — devuelve JWT |

### Gestión de usuarios

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/auth/users/{userId}` | Obtener información de un usuario por ID |
| `PUT` | `/api/auth/users/{userId}/profile` | Actualizar perfil (teléfono, bio, dirección, imagen, telegramChatId) |
| `PUT` | `/api/auth/users/{userId}/password` | Cambiar contraseña |
| `GET` | `/api/auth/users/role/{role}` | Listar usuarios por rol |

### Vinculación de Telegram

| Método | Ruta | Descripción |
|--------|------|-------------|
| `PATCH` | `/api/auth/users/{userId}/telegram` | Vincular o desvincular cuenta de Telegram |

Este endpoint es **voluntario** — el usuario puede usarlo desde su perfil en la app para activar notificaciones de Telegram. No es requerido para ningún otro flujo del sistema.

**Request:**
```json
{ "telegramChatId": "7184207241" }
```

**Response:** `UserInfoResponse` completo con el `telegramChatId` actualizado.

Para desvincular, enviar `telegramChatId: null`.

### Flujo de invitación de staff

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/auth/staff-invite` | Crear invitación para WAITER o CHEF |
| `POST` | `/api/auth/register/staff` | Completar registro con token de invitación |
| `PUT` | `/api/auth/users/{userId}/approve` | Aprobar usuario pendiente |
| `PUT` | `/api/auth/users/{userId}/reject` | Rechazar usuario pendiente |
| `GET` | `/api/auth/users/pending` | Listar usuarios pendientes de aprobación |

### Restablecimiento de contraseña

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/auth/password-reset/request` | Solicitar token de restablecimiento |
| `POST` | `/auth/password-reset/confirm` | Confirmar nueva contraseña con token |

---

## Modelo de usuario

```
users
├── id
├── name
├── email              (único)
├── username           (único)
├── password_hash
├── role               (CUSTOMER | RESTAURANT_MANAGER | WAITER | CHEF | ADMIN)
├── approval_status    (APPROVED | PENDING_APPROVAL | REJECTED)
├── phone
├── bio
├── profile_image_url
├── address
├── government_id
├── telegram_chat_id   ← opcional, vinculado por el usuario desde su perfil
├── invite_token
├── invite_token_expiry
├── invited_restaurant_id
├── reset_token
├── reset_token_expiry
└── created_at
```

El campo `telegram_chat_id` es `null` por defecto. Solo se popula cuando el usuario decide vincular su cuenta de Telegram desde la app.

---

## Roles y aprobación

| Rol | Registro | Aprobación |
|-----|----------|-----------|
| `CUSTOMER` | Auto-registro | Automática |
| `RESTAURANT_MANAGER` | Auto-registro | Requiere aprobación de admin |
| `WAITER` / `CHEF` | Solo por invitación | Requiere aprobación del manager |
| `ADMIN` | Auto-registro | Automática |

---

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `SPRING_DATASOURCE_URL` | URL de PostgreSQL (`auth_db`) |
| `SPRING_DATASOURCE_USERNAME` | Usuario de BD |
| `SPRING_DATASOURCE_PASSWORD` | Contraseña de BD |
| `JWT_SECRET` | Clave secreta para firmar los tokens JWT |

---

## Cómo obtener el chat_id de Telegram

El usuario debe seguir estos pasos para vincular su cuenta:

1. Buscar el bot de la app en Telegram y presionar **Start**.
2. En la app, ir a **Perfil → Notificaciones → Vincular Telegram**.
3. El frontend llama a `PATCH /auth/users/{id}/telegram` con el `chat_id` obtenido.

Para obtener el `chat_id` manualmente:
```
https://api.telegram.org/bot<TOKEN>/getUpdates
```
El campo `message.chat.id` del JSON de respuesta es el `chat_id`.
