# Custom Agents

## Available
- `asset-frontend-implementer.agent.md`: implementation agent for Asset Management frontend tasks.

## Suggested Usage
1. Use `implementa-frontend.prompt.md` to launch scoped implementation work.
2. Use `review-frontend-implementation.prompt.md` for post-implementation quality checks.
3. Keep role checks, types, mock data, and shadcn MCP workflow mandatory.

## Notes
- Agent-level stop hooks run lint/build for `asset-management/`.
- Keep agent frontmatter minimal and explicit about tools and constraints.
