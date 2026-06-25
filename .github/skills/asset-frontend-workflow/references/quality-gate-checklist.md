# Quality Gate Checklist

Use this checklist before closing any frontend task.

## Functional
- Route works and navigation state is coherent.
- Role permissions are enforced through `useAuth` and route guards.
- Empty, loading, and error states are handled.

## Data and Typing
- Domain models reuse `src/lib/types.ts`.
- Mock datasets come from `src/lib/mock-data.ts`.
- No duplicated ad-hoc types when an existing type can be reused.

## UI Consistency
- Existing components in `src/components/ui/` are reused first.
- New primitives are added only through shadcn MCP workflow.
- Layout and spacing remain consistent with existing pages.

## Validation
- Forms use `react-hook-form` and `zod` where input exists.
- Basic unsafe input patterns are avoided in rendering and parsing.

## Build Health
- `npm run lint` passes in `asset-management/`.
- `npm run build` passes in `asset-management/`.

## Delivery Output
- Changed files listed.
- shadcn components used/added listed.
- Lint/build results reported.
- Follow-up items called out if blocked.
