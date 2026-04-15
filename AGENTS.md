# NexaTech Monorepo Rules & Conventions

This document defines the core standards for all agents and developers working on the NexaTech project.

## 1. Development Workflow

- **Root-First Commands**: Always use commands defined in the root `package.json` to ensure consistency across the monorepo.
  - Use `npm run dev:all` to run all services.
  - Use `npm run w:dev:<workspace>` to run a specific service.
  - Never run `npm` commands directly inside subdirectories unless absolutely necessary.
- **Port Management**: Strictly adhere to the port assignments defined in the root `README.md`.

## 2. Code Architecture

### Domain-Driven Organization
Organize code by functional domains (features) rather than technical roles where possible.
- **Features**: Complex logic and components should live in `src/features/[domain]`.
- **Shared Components**: General-purpose UI components (like buttons, inputs) go into `src/components/ui`.
- **Custom Components**: Domain-specific but reusable components within a project go into `src/components/custom/[domain]`.

### Component Standards
- **Size Limit**: A single component file **MUST NOT exceed 400 lines**.
  - If a component grows beyond this limit, refactor by extracting sub-components or moving logic into custom hooks.
- **Clean Code**:
  - Use descriptive naming for variables, functions, and components.
  - Keep components focused on a single responsibility.
  - Prefer functional components with hooks over class components.
  - Extract complex business logic into custom hooks (`useDomainLogic.ts`).

## 3. Technology Stack

- **Styling**: Use Vanilla CSS or Tailwind CSS as per the specific project configuration (prefer standard utilities).
- **Icons**: Use `lucide-react` for icons.
- **State Management**: Use Redux Toolkit (if configured) or React Context for local/feature state.
- **API**: Use Axios for HTTP requests, centralized in `src/lib/axios.ts` or `src/features/[domain]/api.ts`.

## 4. Design System

Strictly follow the `design-system/nexatech/MASTER.md` for:
- Color Palette (Apple-style)
- Typography (Inter font)
- Spacing and Layout (Bento Grid, Glassmorphism)

---
*Note: These rules are foundational. Sub-projects may have additional `AGENTS.md` or `CLAUDE.md` files that extend these rules.*
