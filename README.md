# Team Task Manager

A full-stack team collaboration app for managing teams, members, and tasks. The application includes session-based authentication, protected routes, team ownership controls, task tracking, and due-date reminders.

Built with:
- React + Vite + Tailwind CSS for the frontend
- Node.js + Express for the backend API
- PostgreSQL via Neon for data storage
- Passport.js + express-session for authentication

## Features

- User registration and login
- Protected authenticated routes
- Team creation, editing, and deletion
- Team member management by team owner
- Task creation, editing, deletion, and status tracking
- Priority and due date support
- Dashboard with summary metrics and “Due soon” reminders
- Consistent modern UI design
- Bonus-style team access controls and invite stub for future extension

## Tech Stack

Frontend
- React 19
- Vite
- Tailwind CSS
- React Router
- Axios

Backend
- Node.js
- Express 5
- PostgreSQL client (pg)
- Passport.js
- express-session
- connect-pg-simple
- bcrypt

Database
- Neon PostgreSQL

## Project Structure

```text
Team Task Manager/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── validators/
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   ├── .env
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── README.md
└── .gitignore
```

## Prerequisites

Before running the project locally, make sure you have:
- Node.js installed
- npm installed
- A Neon PostgreSQL database set up
- Access to the project’s environment variables

## Environment Setup

### Backend
Create a `.env` file in the `backend` folder with:

```env
PORT=8080
DATABASE_URL=your_neon_postgres_connection_string
SESSION_SECRET=your_session_secret
NODE_ENV=development
```

Notes:
- Use your Neon PostgreSQL connection string for `DATABASE_URL`.
- Keep the session secret secure and unique for your environment.

### Frontend
Create a `.env` file in the `frontend` folder with:

```env
VITE_API_URL=http://localhost:8080
```

## Installation

1. Open a terminal in the project root.
2. Install backend dependencies:

```bash
cd backend
npm install
```

3. Install frontend dependencies:

```bash
cd ../frontend
npm install
```

## Running the App

### Start the backend

```bash
cd backend
npm start
```

The backend server runs on:
- http://localhost:8080

### Start the frontend

Open a second terminal:

```bash
cd frontend
npm run dev
```

The frontend runs on:
- http://localhost:5173

## Default User Flow

1. Register a new account or sign in with an existing user.
2. Create one or more teams.
3. Add members to a team (owner-only access is enforced in the app).
4. Create tasks inside teams.
5. Update task status, priority, or due date.
6. Track dashboard summaries and due-soon reminders.

## Main Pages

- Login
- Register
- Dashboard
- Teams
- Tasks
- Team Details

## Authentication

Authentication is handled with Passport.js and session cookies.

- Login uses email + password
- Protected routes require a valid session
- The backend uses `withCredentials: true` on the frontend so browser cookies are sent correctly

## Database Notes

This project is connected to Neon Postgres and uses:
- users
- teams
- team_members
- tasks

The team membership model supports ownership-based actions such as team deletion and member management.

## Notes for GitHub / Employer Upload

This project is structured as a working full-stack application and is ready to be uploaded to GitHub as a portfolio or employer-facing project.

It demonstrates:
- full-stack application architecture
- database integration with Neon
- secure session-based authentication
- team/task management workflows
- frontend/backend separation
- polished React UI

## Future Enhancements

Possible future additions include:
- real email invites with SMTP
- task reminders via email or push notifications
- role management beyond owner/member
- comments or notes on tasks
- drag-and-drop kanban board
- advanced analytics and reporting

## License

This project is intended for project/demo use and can be adapted for internal or employer-facing portfolio purposes.
