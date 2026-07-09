# My Daily Buddy — Super Admin Panel

A modern, production-ready admin dashboard for managing the **My Daily Buddy** platform. Built with React, TypeScript, Tailwind CSS, and Vite — featuring a custom design system, reusable UI component library, and end-to-end API tests.

![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38BDF8?logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-4.3-646CFF?logo=vite&logoColor=white)

---

## ✨ Features

- **Secure OTP Login** — Split-panel branded login with email verification via backend API
- **Dashboard** — Live stat cards, bar chart overview (Recharts), and quick-action shortcuts
- **Plans Management** — Full CRUD for subscription plans with status toggling and soft-delete
- **Subscriptions** — Assign plans to users, filter by plan / status / date range
- **Users Directory** — Read-only user listing with role and account-status filters
- **Notifications** — Manually process pending push notification queue with real-time feedback
- **Reusable UI Library** — 10+ shared components (Button, Card, Modal, DataTable, Alert, etc.)
- **Design System** — Custom brand palette, mesh backgrounds, card shadows, and micro-animations
- **E2E API Tests** — Automated test script covering auth, CRUD, filters, and edge cases

---

## 🛠 Tech Stack

| Layer | Technology |
|-------------|----------------------------------------------|
| Framework | React 18 + TypeScript |
| Build Tool | Vite 4 |
| Routing | React Router DOM 7 |
| Styling | Tailwind CSS 3.4 + PostCSS + Autoprefixer |
| Utilities | clsx + tailwind-merge (`cn()` helper) |
| Icons | Lucide React |
| Charts | Recharts |
| HTTP Client | Native `fetch` with JWT auth + auto token refresh |
| Typography | Inter (Google Fonts) |

---

## 📋 Prerequisites

- **Node.js** 18+
- **My Daily Buddy backend** running (default: `http://localhost:5001/api`)
- A **super admin account** seeded in the backend (`role_id = 0`)

---

## 🚀 Quick Start

```bash
# 1. Clone and navigate
cd super-admin

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit VITE_API_URL if your backend runs on a different port

# 4. Start dev server
npm run dev
```

Open **http://localhost:5173** and sign in with your super admin email.

---

## ⚙️ Environment Variables

| Variable | Default | Description |
|----------------|-------------------------------|---------------------------------------------------|
| `VITE_API_URL` | `http://localhost:5001/api` | Backend API base URL (must include `/api` prefix) |

Create a `.env` file from the template:

```bash
cp .env.example .env
```

---

## 📜 Scripts

| Command | Description |
|---------------------|--------------------------------------------------|
| `npm run dev` | Start development server (port 5173) |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run test:e2e` | Run end-to-end API integration tests |

---

## 🧪 E2E Testing

The project includes a comprehensive E2E test script (`scripts/e2e-test.mjs`) that validates all API endpoints used by the panel.

### What it covers

- ✅ Super admin login + OTP verification flow
- ✅ Dashboard stat endpoint aggregation
- ✅ Plans CRUD (create → update → soft delete)
- ✅ Subscriptions listing and assignment
- ✅ Users listing with role/status filters
- ✅ Push notification processing
- ✅ Token refresh flow
- ✅ 401 unauthorized without token
- ✅ Non-existent / non-super-admin email rejection

### Running tests

```bash
# Basic (requires manually providing OTP)
npm run test:e2e

# With pre-supplied credentials
SA_USER_ID=<id> SA_OTP=<otp> npm run test:e2e

# Auto-extract OTP from backend terminal log
SA_TERMINAL_LOG=/path/to/backend.log npm run test:e2e

# Custom API URL
VITE_API_URL=http://localhost:5001/api npm run test:e2e
```

---

## 📁 Project Structure

```
super-admin/
├── index.html                    # Entry HTML
├── vite.config.ts                # Vite configuration
├── tailwind.config.js            # Custom design system tokens
├── postcss.config.js             # PostCSS + Autoprefixer
├── .env.example                  # Environment variable template
├── package.json
│
├── scripts/
│   └── e2e-test.mjs              # End-to-end API integration tests
│
└── src/
    ├── main.tsx                   # App bootstrap
    ├── App.tsx                    # Route definitions + auth guards
    ├── api.ts                     # API client, JWT management, auto-refresh
    ├── styles.css                 # Global styles + Tailwind directives
    │
    ├── types/
    │   └── index.ts               # TypeScript interfaces (User, Plan, Subscription, etc.)
    │
    ├── context/
    │   └── AuthContext.tsx         # Auth state provider + route protection
    │
    ├── lib/
    │   └── utils.ts               # cn() helper (clsx + tailwind-merge), initials
    │
    ├── components/
    │   ├── Layout.tsx             # Sidebar + header shell with navigation
    │   ├── SuperAdminLogin.tsx    # Split-panel OTP login page
    │   └── ui/                    # Reusable UI component library
    │       ├── Alert.tsx          # Dismissable alert banners
    │       ├── Button.tsx         # Variant-based button (primary, secondary, ghost, danger)
    │       ├── Card.tsx           # Card, CardHeader, CardContent, CardFooter
    │       ├── DataTable.tsx      # Sortable data table with loading skeletons
    │       ├── EmptyState.tsx     # Illustrated empty-state placeholder
    │       ├── FilterBar.tsx      # Search + filter controls wrapper
    │       ├── Modal.tsx          # Dialog overlay with transitions
    │       ├── PageHeader.tsx     # Page title, description, and action buttons
    │       ├── Pagination.tsx     # Page navigation with size selector
    │       └── StatusBadge.tsx    # Colored status pills (active, expired, etc.)
    │
    └── pages/
        ├── Dashboard.tsx          # Stat cards, bar chart, quick actions
        ├── PlansPage.tsx          # Plans listing + create/edit/delete modals
        ├── SubscriptionsPage.tsx  # Subscriptions listing + assign modal
        ├── UsersPage.tsx          # Read-only user directory with filters
        └── NotificationsPage.tsx  # Push notification queue processor
```

---

## 🎨 Design System

The Tailwind config extends the default theme with a custom design system:

| Token | Description |
|----------------------------|------------------------------------------------|
| `brand-50` → `brand-950` | Indigo brand palette (11 shades) |
| `surface` / `surface-muted` | Background surface colors |
| `shadow-card` | Subtle card elevation |
| `shadow-card-hover` | Elevated card on hover with brand tint |
| `shadow-glow` | Soft brand glow effect |
| `bg-mesh` | Multi-point radial gradient background |
| `bg-sidebar-gradient` | Dark sidebar gradient (slate → indigo) |
| `animate-fade-in` | 350ms fade-in |
| `animate-slide-up` | 400ms slide-up with easing |
| `animate-pulse-soft` | Gentle 3s pulse |
| `animate-shimmer` | Loading skeleton shimmer |
| `font-sans` | Inter typeface stack |

---

## 🔌 API Endpoints Used

| Feature | Method | Endpoint |
|----------------------|--------|--------------------------------------|
| Login | POST | `/super-admin/login` |
| Verify OTP | POST | `/auth/verify-otp` |
| Refresh Token | POST | `/auth/refresh-token` |
| List Plans | GET | `/admin/plans` |
| Create Plan | POST | `/admin/plans` |
| Update Plan | PATCH | `/admin/plans/:id` |
| Delete Plan (soft) | DELETE | `/admin/plans/:id` |
| List Subscriptions | GET | `/admin/subscriptions` |
| Assign Subscription | POST | `/admin/subscriptions` |
| List Users | GET | `/users/admin/list` |
| Process Notifications | POST | `/notifications/process` |

---

## 🔐 Authentication Flow

```
┌──────────┐     POST /super-admin/login      ┌──────────┐
│  Login   │ ──────────────────────────────▶  │ Backend  │
│  Screen  │ ◀────────────── userId ──────── │  Server  │
│          │                                   │          │
│  Enter   │     POST /auth/verify-otp         │          │
│  OTP     │ ──────────────────────────────▶  │          │
│          │ ◀─── access_token + refresh ──── │          │
└──────────┘                                   └──────────┘

1. Enter super admin email → backend sends OTP to email
2. Enter OTP → backend returns JWT access + refresh tokens
3. Tokens stored in localStorage, attached to all API requests
4. On 401 response → automatic token refresh via /auth/refresh-token
5. If refresh fails → session cleared, redirect to /login
```

---

## 🌱 Seeding a Super Admin

From the backend repository:

```bash
cd my-daily-buddy-backend

# Seed dheerajsingh1939@gmail.com
npm run seed:superadmin:dheeraj

# Seed dheerajsingh1@gmail.com
npm run seed:superadmin
```

> If the email already exists as a regular user, the seeder promotes it to `role_id = 0`.

---

## 🏗 Production Build

```bash
npm run build
```

Deploy the `dist/` folder to any static host:

- **Vercel** — zero-config, auto-detects Vite
- **Netlify** — set build command to `npm run build`, publish `dist`
- **AWS S3 + CloudFront** — upload `dist/` to S3 bucket
- **Firebase Hosting** — `firebase deploy` with `dist` as public dir

> Set `VITE_API_URL` to your production API URL **at build time** (it's baked into the bundle).

---

## 🤝 Contributing

1. Create a feature branch from `main`
2. Follow existing component patterns in `src/components/ui/`
3. Use the `cn()` utility for conditional class merging
4. Run `npm run test:e2e` to verify API integrations
5. Submit a pull request for review

---

## 📄 License

Private — My Daily Buddy internal use.
