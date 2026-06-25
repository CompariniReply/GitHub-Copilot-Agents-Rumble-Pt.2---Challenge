---
name: asset-frontend-workflow
description: "Implement frontend features for the asset-management challenge with React 19, Vite, Tailwind v4, shadcn/ui via MCP, react-hook-form + zod, role checks via useAuth, and final lint/build validation. Use for Catalog, Dashboard, Users, Settings tasks."
argument-hint: "Feature to implement, pages involved, role rules, and acceptance criteria."
user-invocable: true
---

# Asset Frontend Workflow

## When to Use
- Build or update UI in `asset-management/src/`.
- Implement Catalog, Dashboard, Users, or Settings features.
- Add new shadcn/ui components through MCP instead of handcrafting.

## Procedure
0. Start from the feature brief template:
   - [Feature Brief Template](./assets/feature-brief-template.md)
1. Reuse existing code first:
   - `src/components/ui/*`
   - `src/hooks/useAuth.tsx`
   - `src/lib/types.ts`
   - `src/lib/mock-data.ts`
   - `src/components/charts.tsx`
2. If a UI primitive is missing, use shadcn MCP flow:
   - Discover: `mcp_shadcn_get_project_registries`, `mcp_shadcn_search_items_in_registries`
   - Inspect: `mcp_shadcn_view_items_in_registries`, `mcp_shadcn_get_item_examples_from_registries`
   - Install: `mcp_shadcn_get_add_command_for_items`
3. Implement minimal, typed changes with existing routing/auth conventions.
4. Validate in `asset-management/`:
   - `npm run lint`
   - `npm run build`
5. Verify release quality with:
   - [Quality Gate Checklist](./references/quality-gate-checklist.md)

## Related Prompt
- `/.github/prompts/review-frontend-implementation.prompt.md`

## Output Checklist
- List changed files and behavior.
- List shadcn components added/reused.
- Confirm role-based constraints.
- Report lint/build results.
