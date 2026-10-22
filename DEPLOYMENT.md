# Deployment Guide

This application is deployed using **Render** for hosting and **Neon** for the PostgreSQL database.

The project runs as a single Docker service. Express serves the backend API and the built React frontend from the same origin.

- **Hosting:** Render
- **Database:** Neon (serverless PostgreSQL)
- **Deployment method:** Docker
- **Frontend:** React and Vite
- **Backend:** Node.js and Express

## 1. Prerequisites

Before deploying, make sure you have:

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

## 4. Create the Render Service

1. Sign in to Render and open your project.
2. Select **Create new service**, then choose **Web Service** if prompted.
3. Connect the GitHub repository containing this project.
4. Select the branch you want to deploy.
5. Configure the service to build using Docker.

Use the following settings:

| Setting | Value |
| --- | --- |
| Service name | `team-task-manager` |
| Root directory | Repository root |
| Runtime | Docker |
| Dockerfile path | `./Dockerfile` |
| Health check path | `/api/health` |

The root-level Dockerfile builds the frontend and serves it through the Express backend, so separate frontend and backend services are not required.

## 5. Configure Environment Variables

In the Render service's environment settings, add the following variables:

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

## 6. Deploy the Application

1. Save the service configuration and environment variables.
2. Start the deployment from Render.
3. Review the build and runtime logs for errors.
4. Once the deployment succeeds, open the service URL provided by Render.

Render builds the Docker image using the repository's Dockerfile, so Docker does not need to be installed on your local machine.

## 7. Verify the Deployment

Open the following endpoint using your deployed Render URL:

`https://YOUR-RENDER-URL/api/health`

A successful response should return:

```json
{
  "status": "ok"
}
```

Then open the main application and test registration, login, team creation, task management, and session persistence.

## Troubleshooting

| Problem | What to check |
| --- | --- |
| The service fails to start | Review the Render runtime logs and confirm the required environment variables are set. |
| Database connection fails | Verify `DATABASE_URL`, database credentials, network access, and SSL configuration. |
| `SESSION_SECRET must be set` | Add `SESSION_SECRET` to the Render environment settings. |
| `relation "users" does not exist` | Apply the database schema using `npm run db:init`. |
| Login does not persist | Confirm the app is running with `NODE_ENV=production` over HTTPS and that the PostgreSQL session store is working. |
| The health endpoint fails | Check the deployment logs and confirm the service is listening on the configured port. |

## Security Notes

- Never commit database credentials or production secrets to GitHub.
- Keep `.env` files out of version control.
- Use HTTPS for the deployed application.
- Use a strong, unique session secret.
- Back up important database data before making schema changes.
