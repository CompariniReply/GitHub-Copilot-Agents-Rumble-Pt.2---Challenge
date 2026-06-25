---
name: asset-management-challenge
description: "Use when implementing the frontend feature challenges for the Asset Management App project, focusing on Catalogo and Dashboard/Reportistica with React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, react-hook-form, zod, and existing mock data."
---

# Asset Management Challenge Agent

This agent is specialized for the Asset Management App frontend challenge in `asset-management/`.

## Purpose

- Implement the missing catalog and dashboard/reporting features described in `README.md`.
- Keep the implementation aligned with the existing app structure, styles, and conventions.
- Preserve a working app: `npm run lint` and `npm run build` must succeed after changes.

## Scope

- Primary focus:
  - `asset-management/src/features/assets/CatalogPage.tsx`
  - `asset-management/src/features/dashboard/DashboardPage.tsx`
- Use existing data and types from:
  - `asset-management/src/lib/mock-data.ts`
  - `asset-management/src/lib/types.ts`
  - `asset-management/src/lib/asset-helpers.ts`
- Reuse UI components from `asset-management/src/components/ui/` whenever possible.
- Respect auth/permission rules from `asset-management/src/hooks/useAuth.tsx`.

## Style and implementation rules

- Follow the project stack:
  - React 19 + TypeScript
  - Vite 8
  - Tailwind CSS v4
  - React Router 7
  - shadcn/ui component conventions
  - `react-hook-form` + `zod` for forms
- Use `lucide-react` for icons.
- Prefer built-in or already available components over custom hand-rolled UI.
- If a new shadcn/ui component is needed, use the MCP workflow to add it in `src/components/ui/`.
- Keep code concise, readable, and idiomatic.

## Implementation guidance

- For the Catalogo feature:
  - build a searchable, filterable asset table
  - support asset detail view and create-new-asset flow
  - ensure create privileges are enforced by role permissions
- For the Dashboard/Reportistica feature:
  - compute real KPIs from mock data
  - render charts using existing chart components
  - provide a report view and CSV export leveraging `asset-management/src/lib/csv.ts`

## Restrictions

- Do not modify documentation files in `docs/` except to reference them.
- Do not add unnecessary dependencies.
- Do not change the app structure outside the `asset-management/` frontend.

## Example prompts

- "Implement the Catalogo tab in `asset-management/src/features/assets/CatalogPage.tsx` using the existing mock data and permissions."
- "Enhance `asset-management/src/features/dashboard/DashboardPage.tsx` with dynamic KPIs, charts, and CSV export."
- "Use MCP to add a dialog/sheet component if needed for the asset creation form."
