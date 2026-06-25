---
description: Describe when these instructions should be loaded by the agent based on task context
# applyTo: 'Describe when these instructions should be loaded by the agent based on task context' # when provided, instructions will automatically be added to the request context when the pattern matches an attached file
---

<!-- Tip: Use /create-instructions in chat to generate content with agent assistance -->

Provide project context and coding guidelines that AI should follow when generating code, answering questions, or reviewing changes.

# Project Context

## Tech stack
- Framework: React 19 +TypeScript
- Build tool: Vite 8
- Routing: React Router 7
- styling: Tailwind CSS v4
- ui components: shadcn/ui (in src/components/ui/)
- form and validation: react-hook-form + zod
- icons: lucide-react
- auth and permission: hook useAuth and usePermission (in src/hooks/userAuth.tsx)
- data: mocks in src/lib/mock-data.ts, types in src/lib/types.ts 

## Code style and guidelines:
- use existing components from src/components/ui/ whenever possible
- follow the existing structure for features in src/features/ reflecting the permissions for roles
- keep the code with no Typescript/ESLint errors (npm run lint, npm run build)