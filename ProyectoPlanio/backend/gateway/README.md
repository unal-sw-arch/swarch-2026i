# Planio API Gateway

API gateway for the Planio project.

## Technologies Used

- Node.js runtime
- Container-based deployment with Docker

## Current Data Status

At this stage, the frontend is still working with mock data.

- Gateway integration with real frontend requests is pending.
- Backend endpoints should be connected in the next integration phase.

## Docker Deployment

We use Docker to deploy services in a reproducible and easy way.

Example workflow:

```bash
docker build -t planio-gateway .
docker run -d -p 3000:3000 --name planio-gateway planio-gateway
```

Adjust ports and environment variables based on your local setup.