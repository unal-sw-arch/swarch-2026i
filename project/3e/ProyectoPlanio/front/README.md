# Planio Frontend

## Technologies Used

- React 18
- TypeScript
- Vite 6
- React Router 7
- Material UI (MUI)
- Tailwind CSS 4
- Sonner (toast notifications)
- React DnD (drag and drop)
- Lucide React (icons)
- Firebase Auth

## Firebase Auth Integration

This makes global auth context, protected/public routes, and gateway bearer-token requests using Firebase Auth.

- `src/app/auth/firebase.ts`: Initializes Firebase app and Auth instance from env variables.
- `src/app/auth/authService.ts`: Handles login, register, Google login, logout, and auth error mapping.
- `src/app/auth/token.ts`: Gets the current Firebase ID token and builds Authorization headers.
- `src/app/auth/authFetch.ts`: Wraps fetch and injects `Authorization: Bearer <firebase-id-token>`.
- `src/app/context/AuthContext.tsx`: Stores global session state (`user`, `loading`, `signOut`) via Firebase listener.
- `src/app/components/routing/AuthGuards.tsx`: Defines `RequireAuth` and `PublicOnly` route guards.
- `src/app/routes.ts`: Applies guards so login/register are public-only and rooms routes are private.

### Environment Variables

Copy `.env.example` to `.env` and fill with your Firebase project values:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### Token For API Gateway

Use `authFetch` to send `Authorization: Bearer <firebase-id-token>` in API requests.

API gateway must verify this token with Firebase Admin SDK.

## Current Data Source

The frontend is currently using mock data for rooms, tasks, users, and rewards.

- There is no live API integration yet.
- Mock data is hardcoded in the UI component files.
- Next step is replacing mocked arrays and handlers with backend API calls.

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open:

```text
http://localhost:5173
```

## Docker Deployment

We use Docker to deploy the frontend in a consistent and simple way.

Build the production image:

```bash
docker build -t planio-frontend .
```

Run the container:

```bash
docker run -d -p 8080:80 --name planio-frontend planio-frontend
```

Then open:

```text
http://localhost:8080
```

The Docker setup is included in this folder with a multistage Dockerfile and Nginx configuration.