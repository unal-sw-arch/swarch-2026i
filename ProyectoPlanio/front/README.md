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