# User Service

The **User Service** is the core microservice responsible for handling user identities, authentication management, and the personal gaming wishlists for the GameSeeker application. 

## 🛠️ Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/) (ES Modules)
- **Framework**: [Hono](https://hono.dev/) (Fast, lightweight web framework)
- **Validation**: [Zod](https://zod.dev/) & `@hono/zod-openapi`
- **Authentication**: [Better Auth](https://better-auth.com/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Database**: PostgreSQL
- **Linter/Formatter**: [Biome](https://biomejs.dev/)
- **TypeScript**: Strictly typed backend

## 📖 API Documentation

The User Service features self-generating **OpenAPI (Swagger)** documentation.
When the service is running, you can access the interactive Swagger UI at:

👉 **`http://localhost:4001/ui`**

This UI allows you to explore all available endpoints, required request bodies, and exact response schemas for Authentication and Wishlist operations. 

## ⚙️ Local Development Setup

While the service is typically run via Docker Compose from the project root, you can also run it natively for development purposes.

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file based on `.env.example` in this directory:
```env
DATABASE_URL="postgresql://gameseeker:secretpassword@localhost:5432/gameseeker?schema=public"
BETTER_AUTH_SECRET="your_secret_here"
BETTER_AUTH_URL="http://localhost:4000"
```

### 3. Database Sync (Prisma)
To push your Prisma schema to the database and generate the Prisma Client:
```bash
npx prisma db push
npx prisma generate
```
*(To inspect your local database easily, you can use `npx prisma studio`)*

### 4. Run the Development Server
```bash
npm run dev
```
The server will start on port `4000` and hot-reload on changes.

## 📜 Available Scripts

- `npm run dev` - Starts the development server using `tsx` in watch mode.
- `npm run build` - Compiles TypeScript to JavaScript into the `dist/` directory and resolves aliases.
- `npm run start` - Runs the compiled production build from `dist/app.js`.
- `npm run lint` - Runs the Biome linter to check for code style and formatting issues.
- `npm run lint:fix` - Automatically fixes linter warnings and formats the codebase.

## 🗄️ Project Structure

```text
user-service/
├── prisma/               # Database ORM settings
│   ├── models/           # Prisma schema fragments (wishlist, better-auth)
│   └── schema.prisma     # Main Prisma schema configuration
├── src/                  # Application source code
│   ├── controllers/      # Route handlers and business logic orchestration
│   ├── repositories/     # Database interaction layers (Prisma wrappers)
│   ├── routes/           # OpenAPI route definitions and HTTP verbs
│   ├── schemas/          # Zod validation and OpenAPI component schemas
│   ├── services/         # Core business logic layer
│   └── app.ts            # Hono application entry point & Swagger setup
└── requests.http         # Ready-to-use HTTP requests for VSCode REST Client
```
