# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

A MERN-stack personal finance tracker: users register/log in, log income/expense transactions, set monthly budgets, and view spending via dashboard charts and reports. Two independent apps in one repo, no shared package/workspace config:

- `backend/` — Express 5 (ESM) + Mongoose API, JWT auth
- `frontend/` — React 19 + Vite + Tailwind CSS v4 SPA

## Commands

Run each app from its own directory (no root-level scripts).

**Backend** (`backend/`):
- `npm run dev` — start with nodemon (auto-restart)
- `npm start` — start with node
- No test suite configured (`npm test` is a placeholder)

**Frontend** (`frontend/`):
- `npm run dev` — start Vite dev server
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm run preview` — preview production build

Backend requires `backend/.env` with `MONGO_URI` and `JWT_SECRET` (server exits at boot if `JWT_SECRET` is missing); `JWT_EXPIRES_IN` optional (defaults to `7d`). Frontend reads `VITE_API_URL` (defaults to `http://localhost:5000/api`).

## Architecture

### Backend routing

All resources are wired through the `routes/` router pattern and mounted in `server.js`: `routes/auth.routes.js` (`/api/auth`), `routes/transaction.routes.js` (`/api/transactions`), `routes/budget.routes.js` (`/api/budgets`), `routes/savingsGoal.routes.js` (`/api/goals`). `server.js` itself is just app setup + the four `app.use()` mounts + the `startServer()` bootstrap — no route handlers live there. Each router (except auth) applies `router.use(protect)` once at the top rather than per-route.

### Auth flow

- `POST /api/auth/register` / `POST /api/auth/login` issue a JWT (`middleware/auth.middleware.js` signs/verifies with `JWT_SECRET`).
- `protect` middleware reads `Authorization: Bearer <token>`, verifies it, and attaches the Mongoose user doc (minus password) as `req.user`. All transaction/budget/goals routes require it.
- Frontend stores `token`/`user` in `localStorage` and sets `Authorization` as a default header on the shared `axios` instance (`frontend/src/services/api.js`) via `AuthContext` (`frontend/src/context/AuthContext.jsx`). `ProtectedRoute` (`components/common/ProtectedRoute.jsx`) gates authenticated routes in `App.jsx`.

### Data model

- `User` (`models/user.model.js`): `username` (unique), `password` (bcrypt-hashed on save via pre-save hook), with `matchPassword` instance method.
- `Transaction` (`models/transaction.model.js`): `userId` ref, `amount`, `category`, `type` (`income`|`expense` enum), `date`, optional `description`.
- `Budget` (`models/budget.model.js`): `userId` ref, `month` (`"YYYY-MM"` string), `amount`. Unique compound index on `{ userId, month }` — one budget per user per month.

### Budget auto-creation

`GET /api/budgets` auto-creates a budget row for the current month on first fetch each month, inheriting the `amount` from the most recent prior budget (defaults to `0` if none exists). Each returned budget is enriched server-side with aggregated expense totals, per-category breakdown (with the underlying transactions), `remaining`, `percentageUsed`, and `daysLeft` — this aggregation is *not* stored, it's computed per-request.

### Reporting/aggregation endpoints

`routes/transaction.routes.js` has several MongoDB aggregation-pipeline endpoints: `GET /summary`, `GET /category-breakdown`, `GET /monthly-spending` (current calendar year), and `GET /report` (custom `startDate`/`endDate` range that also computes the equivalent-length *previous* period for comparison, a daily trend, and a savings rate). When modifying these, changes to the aggregation shape must be mirrored in the corresponding frontend service function in `frontend/src/services/transactionService.js` (response shapes are documented there as comments).

### Frontend structure

- `App.jsx` defines all routing: public (`/login`, `/register`) vs. protected routes nested under `ProtectedRoute` + `AppLayout` (sidebar/bottom-nav shell in `components/layout/`).
- Pages live in `frontend/src/pages/` (one per route: Dashboard, Transactions, Categories, Budgets, SavingsGoals, Reports, Profile, Settings).
- API calls are centralized in `frontend/src/services/*Service.js` files (thin wrappers around the shared `api` axios instance), not called directly from components.
- Charts (`components/common/ExpensePieChart.jsx`, `MonthlyBarChart.jsx`) use `recharts` and consume the aggregation endpoints above.
- Category constants live in `constants/transactionCategories.js`; nav items in `constants/navigation.js` — reuse these rather than hardcoding category/nav lists in components.
