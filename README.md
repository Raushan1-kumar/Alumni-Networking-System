# Alumni Association Platform

A full-stack alumni management and engagement platform built with React, Node.js, Express, and MongoDB.

The project enables colleges or institutions to run a private alumni ecosystem with:
- role-based access (`student`, `alumni`, `admin`)
- approval-driven onboarding
- alumni directory and profile management
- community feed, jobs, events, donations, surveys, and success stories

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Core Features](#core-features)
- [Repository Structure](#repository-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Run the Project](#run-the-project)
- [Seed and Utility Scripts](#seed-and-utility-scripts)
- [API Overview](#api-overview)
- [Authentication and Authorization](#authentication-and-authorization)
- [Known Notes](#known-notes)
- [Roadmap Suggestions](#roadmap-suggestions)

## Project Overview

This platform is designed to centralize alumni engagement workflows in one system:
- onboarding with admin approval
- networking through a social feed
- opportunity sharing via a job board
- event discovery and registration
- donation pledges and summaries
- survey creation and response analytics
- success story publishing with moderation

The frontend is a protected SPA (single-page application), and the backend exposes a modular REST API.

## Architecture

High-level request flow:

1. User interacts with React frontend (`frontend`)
2. Frontend sends REST calls to Express API (`backend`)
3. API validates JWT, permissions, and input
4. Mongoose models persist and query MongoDB
5. JSON responses return to the UI

## Tech Stack

### Frontend
- React 19
- React Router
- Axios
- Vite
- Lucide icons

### Backend
- Node.js
- Express 5
- MongoDB + Mongoose
- JWT (`jsonwebtoken`)
- Password hashing (`bcryptjs`)
- CORS + dotenv

## Core Features

- Authentication:
  - student registration
  - alumni registration
  - login with JWT
  - admin-approval gate before login

- User and profile management:
  - searchable alumni directory
  - profile updates
  - password change

- Jobs:
  - alumni/admin can post jobs
  - filter and search job listings
  - apply to jobs
  - poster/admin can manage or close jobs

- Events:
  - admin creates and manages events
  - alumni register/cancel registration
  - attendee tracking

- Community feed:
  - create posts
  - like/unlike
  - comment and delete comments

- Donations:
  - donation pledges with causes
  - anonymous option
  - public recent donations
  - admin donation summary and totals

- Surveys:
  - admin creates surveys
  - alumni submit one response
  - admin can view aggregated results

- Success stories:
  - alumni submit stories
  - admin approves stories before publication

- Admin panel:
  - platform-wide overview across modules
  - pending account approvals
  - survey/event creation from UI
  - story moderation

## Repository Structure

```text
Om_project/
  backend/
    config/
    controllers/
    middleware/
    models/
    routes/
    utils/
      seeds/
    server.js
  frontend/
    src/
    public/
    vite.config.js
```

## Getting Started

### Prerequisites

- Node.js 18+ (recommended)
- npm 9+
- MongoDB (local or cloud instance)

### Clone and install

```bash
# backend
cd backend
npm install

# frontend
cd ../frontend
npm install
```

## Environment Variables

Create `backend/.env`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/alumni_platform
JWT_SECRET=replace_with_a_secure_random_secret
PORT=5000
```

## Run the Project

### 1. Start backend

```bash
cd backend
npm start
```

Backend default URL: `http://localhost:5000`

### 2. Start frontend

```bash
cd frontend
npm run dev
```

Frontend default URL: Vite dev URL (typically `http://localhost:5173`)

## Seed and Utility Scripts

From `backend/`:

```bash
# create a default admin account
node create_admin.js

# mark all existing users approved
node fix_users.js

# run all seeders (users, jobs, events, posts, stories, donations, surveys)
node utils/seeds/seedAll.js
```

Individual seeders are available in `backend/utils/seeds/`.

## API Overview

Base URL: `http://localhost:5000`

- `POST /api/auth/register`
- `POST /api/auth/register/student`
- `POST /api/auth/register/alumni`
- `POST /api/auth/login`
- `GET /api/auth/me`

- `GET /api/users`
- `GET /api/users/:id`
- `PUT /api/users/profile`
- `PUT /api/users/change-password`
- `GET /api/users/admin/pending`
- `PUT /api/users/:id/approve`
- `DELETE /api/users/:id`

- `GET/POST /api/jobs`
- `GET /api/jobs/my-posts`
- `POST /api/jobs/:id/apply`
- `GET /api/jobs/:id/applicants`
- `PUT /api/jobs/:id/close`

- `GET/POST /api/events`
- `GET /api/events/my-registrations`
- `POST /api/events/:id/register`
- `DELETE /api/events/:id/register`
- `GET /api/events/:id/attendees`

- `GET/POST /api/posts`
- `PUT /api/posts/:id/like`
- `POST /api/posts/:id/comments`
- `DELETE /api/posts/:id/comments/:commentId`

- `GET /api/donations/public`
- `GET /api/donations/summary`
- `POST /api/donations`
- `GET /api/donations/my-donations`
- `GET /api/donations` (admin)

- `GET/POST /api/surveys`
- `GET /api/surveys/my-responses`
- `POST /api/surveys/:id/respond`
- `GET /api/surveys/:id/results` (admin)
- `PUT /api/surveys/:id/close` (admin)

- `GET /api/stories`
- `POST /api/stories`
- `GET /api/stories/user/my-stories`
- `GET /api/stories/admin/pending`
- `PUT /api/stories/:id/approve`

## Authentication and Authorization

- JWT is expected in header:
  - `Authorization: Bearer <token>`
- Route protection is implemented via `protect` middleware.
- Admin-only operations are guarded by `adminOnly` middleware.
- Account approval is enforced at login (`isApproved` must be true).

## Known Notes

- Frontend API calls are currently hardcoded to `http://localhost:5000` in multiple components.
- `routes/adminRoutes.js` and `controllers/adminController.js` exist, but `/api/admin` is not mounted in `server.js` in current backend wiring.
- Backend includes utility placeholder files (`cloudinary`, upload, error middleware) that are currently empty.

## Roadmap Suggestions

- move frontend API base URL to environment config (`VITE_API_BASE_URL`)
- add centralized request/response validation
- add automated tests (unit + integration)
- add refresh-token/session invalidation strategy
- add audit logging for sensitive admin actions
- add production deployment manifests (Docker + CI/CD)
