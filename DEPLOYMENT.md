# Deployment Guide

This application is deployed using **Render** for hosting and **Neon** for the PostgreSQL database.

The project runs as a single Docker service. Express serves the backend API and the built React frontend from the same origin.

- **Live application:** https://team-task-manager-els6.onrender.com
- **Hosting:** Render
- **Database:** Neon (serverless PostgreSQL)
- **Deployment method:** Docker
- **Frontend:** React and Vite
- **Backend:** Node.js and Express

## 1. Prerequisites

For a new deployment, make sure you have:

- A GitHub repository containing the application.
- A Neon PostgreSQL database.
- A Render account connected to GitHub.
- The project's root-level `Dockerfile`.

## 2. Configure the Neon Database

1. Open your project in the Neon dashboard.
2. Select your PostgreSQL database and obtain its connection string.
3. Keep the connection string private. Do not commit it to GitHub or add it to the README.

The connection string should use the PostgreSQL URL format:

`postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require`

Use the actual connection string supplied by Neon rather than constructing one manually.

## 3. Initialize the Database Schema

The application requires its database tables to exist before it can be used.

If the schema has not already been applied, initialize it using the project's database initialization script.

1. In your local project, open a terminal in the `backend` directory.
2. Configure `DATABASE_URL` with your Neon connection string and set `DATABASE_SSL=true` in your local environment.
3. Install the backend dependencies if you have not already done so:

   ```bash
   npm install
   ```

4. Run the initialization script:

   ```bash
   npm run db:init
   ```

This applies `backend/db/schema.sql` to the configured database. Run the initialization only when needed, and avoid modifying or resetting an existing database containing data.

## 4. Render Service Configuration

The application is deployed as a Render Web Service using Docker.

The service configuration is:

| Setting | Value |
| --- | --- |
| Service name | `team-task-manager` |
| Root directory | Repository root |
| Runtime | Docker |
| Dockerfile path | `./Dockerfile` |
| Health check path | `/api/health` |

The root-level Dockerfile builds the frontend and serves it through the Express backend, so separate frontend and backend services are not required.

## 5. Environment Variables

Configure the following environment variables in the Render service settings:

| Variable | Value |
| --- | --- |
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Your Neon PostgreSQL connection string |
| `DATABASE_SSL` | `true` |
| `SESSION_SECRET` | A strong, randomly generated secret |

Generate a session secret locally with Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Copy the generated value into Render as `SESSION_SECRET`. Do not commit it to the repository.

Keep `DATABASE_SSL=true` for Neon connections that require SSL. The application defaults to enabling database SSL unless this variable is explicitly set to `false`.

## 6. Deployment and Updates

Render builds the Docker image using the repository's Dockerfile, so Docker does not need to be installed on your local machine.

When application code changes, push the changes to the branch configured in Render. If automatic deployments are enabled, Render will deploy the new version automatically.

After a deployment, review the build and runtime logs for errors.

## 7. Verify the Deployment

The live application is available at:

https://team-task-manager-els6.onrender.com

The API health-check endpoint is:

https://team-task-manager-els
