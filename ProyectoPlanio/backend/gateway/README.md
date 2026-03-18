# Planio API Gateway

API gateway for the Planio project.
The API Gateway is the single entry point for all client requests in Planio. It handles authentication, request routing, and acts as a boundary between the frontend and the microservices.

Responsibilities

Validate authentication tokens using Firebase Authentication

Extract user identity (uid, email, name)

Route requests to the appropriate microservice

Routing
Route Prefix	Service
/activity	Activity Service
/personalization	Personalization Service
/notifications	Notification Service

## Technologies Used

- Node.js runtime
- Firebase sdk
- Container-based deployment with Docker

## Current Data Status

At this stage, the frontend is still working with mock data.

- Gateway integration with real frontend requests is pending.
- Backend endpoints should be connected in the next integration phase.
