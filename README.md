# My Daily Buddy — Super Admin Panel

A modern, production-ready admin dashboard for managing the My Daily Buddy platform. Built with React, TypeScript, Tailwind CSS, and Vite.

![Stack](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8)

## Features

- **Secure OTP login** — Super admin email verification via backend API
- **Dashboard** — Live stats, bar chart overview, and quick actions
- **Plans management** — Create, edit, and deactivate subscription plans
- **Subscriptions** — Assign plans to users, filter by plan/status/date
- **Users** — Read-only user directory with role and status filters
- **Notifications** — Manually process pending push notification queue
- **Modern UI** — Tailwind CSS, Lucide icons, responsive layout, loading skeletons

## Screenshots

| Login | Dashboard |
|-------|-----------|
| Split-panel branded login with OTP flow | Stat cards, chart, and quick actions |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 18 + TypeScript |
| Build | Vite 4 |
| Routing | React Router 7 |
| Styling | Tailwind CSS 3 |
| Icons | Lucide React |
| Charts | Recharts |
| HTTP | Native `fetch` with JWT auth + auto token refresh |

## Prerequisites

- Node.js 18+
- My Daily Buddy backend running (default: `http://localhost:5001/api`)
- A super admin account seeded in the backend (`role_id = 0`)

## Quick Start

```bash
# 1. Install dependencies
cd super-admin
npm install

# 2. Configure environment
cp .env.example .env
# Edit VITE_API_URL if your backend runs on a different port

# 3. Start dev server
npm run dev
```

Open **http://localhost:5173** and sign in with your super admin email.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:5001/api` | Backend API base URL (must include `/api` prefix) |

## Scripts

```bash
npm run dev       # Start development server (port 5173)
npm run build     # Production build → dist/
npm run preview   # Preview production build locally
```

## Project Structure

```
super-admin/
├── src/
│   ├── api.ts                 # API client + auth token management
│   ├── types/                 # TypeScript interfaces
│   ├── context/               # Auth context + route guards
│   ├── lib/utils.ts           # cn() helper, initials
│   ├── components/
│   │   ├── Layout.tsx         # Sidebar + header shell
│   │   ├── SuperAdminLogin.tsx
│   │   └── ui/                # Button, Card, Modal, DataTable, etc.
│   └── pages/                 # Dashboard, Plans, Subscriptions, Users, Notifications
├── tailwind.config.js
├── .env.example
└── README.md
```

## API Endpoints Used

| Feature | Endpoint |
|---------|----------|
| Login | `POST /super-admin/login` |
| Verify OTP | `POST /auth/verify-otp` |
| Refresh token | `POST /auth/refresh-token` |
| Plans CRUD | `GET/POST/PATCH/DELETE /admin/plans` |
| Subscriptions | `GET/POST /admin/subscriptions` |
| Users list | `GET /users/admin/list` |
| Notifications | `POST /notifications/process` |

## Authentication Flow

1. Enter super admin email → `POST /super-admin/login` sends OTP
2. Enter OTP → `POST /auth/verify-otp` returns JWT tokens
3. Tokens stored in `localStorage`, attached to all API requests
4. On 401, tokens auto-refresh via `/auth/refresh-token`
5. Session expires → redirect to `/login`

## Seeding a Super Admin

From the backend repo:

```bash
cd my-daily-buddy-backend
npm run seed:superadmin:dheeraj   # dheerajsingh1939@gmail.com
npm run seed:superadmin           # dheerajsingh1@gmail.com
```

If the email already exists as a regular user, the seeder promotes it to `role_id = 0`.

## Production Build

```bash
npm run build
```

Deploy the `dist/` folder to any static host (Vercel, Netlify, S3 + CloudFront, etc.). Set `VITE_API_URL` to your production API URL at build time.

## License

Private — My Daily Buddy internal use.
