# Customer App

Next.js customer-facing app for Prototype 2.

## Local setup

```powershell
cd apps/customer-app
copy .env.example .env.local
npm install
npm run dev
```

## Required environment variables

- `GATEWAY_BASE_URL`: base URL for the API Gateway.

## Implemented MVP routes

- `/`
- `/login`
- `/register`
- `/restaurants`
- `/restaurants/[id]/menu`
- `/cart`
- `/checkout`
- `/orders`
- `/orders/[id]`
- `/orders/[id]/timeline`
- `/profile`
