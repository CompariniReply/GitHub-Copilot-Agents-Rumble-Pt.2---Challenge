# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an **Asset Management App** challenge for the "GitHub Copilot Agents Rumble Pt. 2" event. The app is a React 19 + TypeScript + Vite frontend with mock data (no backend). Sprint 1 (login, roles/permissions, user list) is complete. The challenge is to implement two placeholder features: **Catalogo Asset** (Sprint 2) and **Dashboard & Reportistica** (Sprint 4-5).

All functional specs live in `docs/` (do not modify those files). User stories with BDD acceptance criteria are in `docs/user-stories.md`.

## Commands

All commands must be run from the `asset-management/` directory:

```bash
cd asset-management
npm install        # first time or after package.json changes
npm run dev        # dev server at http://localhost:5173
npm run build      # tsc + vite build (must pass before delivery)
npm run lint       # ESLint (must pass before delivery)
npm run preview    # serve production build locally
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript 6 |
| Build | Vite 8 |
| Routing | React Router 7 (`react-router-dom`) |
| Styling | Tailwind CSS v4 (via `@tailwindcss/vite`) |
| UI Components | shadcn/ui (in `src/components/ui/`) |
| Forms | `react-hook-form` + `zod` |
| Icons | `lucide-react` |

## Architecture

```
asset-management/src/
├── App.tsx                    # Routes: /, /catalogo, /utenti, /settings
├── features/                  # Feature-based folders
│   ├── assets/CatalogPage.tsx # Challenge 1 (placeholder)
│   ├── dashboard/DashboardPage.tsx # Challenge 2 (basic KPIs exist)
│   ├── auth/LoginPage.tsx
│   ├── users/UsersPage.tsx
│   └── settings/SettingsPage.tsx
├── components/
│   ├── ui/                    # shadcn/ui primitives (button, card, table, badge, etc.)
│   ├── charts.tsx             # DonutChart, HorizontalBarChart, StackedBarChart (SVG, no deps)
│   ├── layout/               # AppLayout with sidebar nav
│   └── auth/                 # ProtectedRoute wrapper
├── hooks/useAuth.tsx          # AuthProvider context: login, logout, permissions, hasRole
└── lib/
    ├── types.ts               # Domain types: Asset, User, Department, AssetCategory, AssetStatus, RolePermissions
    ├── mock-data.ts           # 34 assets, 10 users, 8 departments + rolePermissions map
    ├── asset-helpers.ts       # ASSET_CATEGORIES, ASSET_STATUSES, BRANDS_BY_CATEGORY, formatCurrency, formatDate, parseDate, status→badge variant/color mappings
    ├── csv.ts                 # downloadCSV(baseName, rows) — Excel-compatible CSV export (`;` separator, UTF-8 BOM)
    └── utils.ts               # cn() utility (clsx + tailwind-merge)
```

## Key Conventions

- **Feature-based structure**: each feature lives in `src/features/<name>/`.
- **Reuse existing UI components** in `src/components/ui/`. Add new shadcn/ui components via `npx shadcn@latest add <component>` (MCP server configured in `.vscode/mcp.json`).
- **Role-based permissions**: use `useAuth()` hook — check `permissions.canCreate`, `permissions.canViewReports`, etc. Three roles: Admin (full), Manager (create/edit/assign/view), Viewer (read-only).
- **Mock data only**: no API calls. All state is in-memory from `mock-data.ts`.
- **Italian UI**: labels, column headers, and messages are in Italian.
- **Date format**: `GG/MM/AAAA` (use `formatDate`/`parseDate` from `asset-helpers.ts`).
- **Currency**: format with `formatCurrency` (Italian locale, EUR).
- **Path aliases**: `@/` maps to `src/`.

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `mario.rossi@azienda.it` | `Admin123!` |
| Manager | `laura.bianchi@azienda.it` | `Manager123!` |
| Viewer | `marco.neri@azienda.it` | `Viewer123!` |

## Repository Hooks

The repo has GitHub Copilot hooks in `.github/hooks/`:
- `lock-instructions.json` — gates access to `.github/instructions/` (env `LOCK_INSTRUCTIONS`)
- `lock-skills.json` — gates access to `.github/skills/` (env `LOCK_SKILLS`)
- `token-usage.json` — logs token consumption to `scoring/tokens.txt` on session stop

To unlock instructions or skills, set the respective env var to `"0"` in the hook JSON and restart the session.

## Scoring

Token usage is tracked in `scoring/tokens.txt` (auto-generated, committed for evaluation). The challenge is scored on implementation quality, correctness vs. BDD criteria, and token efficiency.
