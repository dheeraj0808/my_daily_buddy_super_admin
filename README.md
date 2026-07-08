# Super Admin Frontend

Vite + React admin panel for My Daily Buddy super admins.

## Features

- OTP login (`POST /api/super-admin/login` + `/api/auth/verify-otp`)
- Dashboard with summary stats
- Plans CRUD (create, edit, soft-delete)
- Subscription assignment and listing
- Users list (read-only, with filters)
- Process pending notifications

## Setup

```bash
cd super-admin
npm install
cp .env.example .env   # adjust VITE_API_URL if your backend port differs
npm run dev
```

Open `http://localhost:5173`. Unauthenticated users are redirected to `/login`.

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:5001/api` | Backend API base URL (includes `/api` prefix) |

## Scripts

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run preview` — preview production build
