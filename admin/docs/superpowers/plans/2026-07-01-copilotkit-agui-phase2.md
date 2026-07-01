# CopilotKit / AG-UI Phase 2 (Connection Fix + Generative UI) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the CopilotKit v2 connection to the Python agent-service (protocol mismatch bug) so `useAgent()` actually connects instead of silently falling back to legacy SSE, and add generative UI cards for product/order/inventory tool calls.

**Architecture:** `CopilotKitProvider` switches from `runtimeUrl` (Node CopilotKit Runtime protocol — we have no such server) to `selfManagedAgents` holding a `LangGraphHttpAgent` instance pointed directly at the Python AG-UI endpoint. A new hook registers `useRenderToolCall` renderers per tool name, reusing the existing `AgentProductCard`/`AgentOrderCard`/`AgentInventoryTable` components instead of the raw-JSON fallback.

**Tech Stack:** React 19, Vite, TypeScript, `@copilotkit/react-core` v1.59.1 (v2 API surface), `@ag-ui/client`, new dependency `@ag-ui/langgraph`, Zod.

## Global Constraints

- Do not touch the legacy SSE path (`/runs`, `/runs/stream`, `streamAgentResponse` in `src/pages/admin/agent/index.tsx`) — keep as fallback per explicit decision.
- Do not implement HITL (`useHumanInTheLoop`) in this plan — deferred pending a live spike, see spec `docs/superpowers/specs/2026-07-01-copilotkit-agui-phase2-design.md`.
- Do not redesign `AgentProductCard`/`AgentOrderCard`/`AgentInventoryTable` — reuse as-is.
- No automated test runner exists in this project (`package.json` has no `test` script, no vitest/jest). Verification for this plan is `tsc -b` (type check), `eslint`, and manual browser testing — do not introduce a test framework to satisfy this plan.
- Backend (`agent-service`) is out of scope for this plan — no Python changes.

---

### Task 1: Fix the CopilotKit connection (`selfManagedAgents` + `LangGraphHttpAgent`)

**Files:**
- Modify: `package.json` (add `@ag-ui/langgraph` dependency)
- Modify: `.env.example` (document `VITE_COPILOTKIT_AGENT_ID`)
- Modify: `src/pages/admin/agent/index.tsx:867-885` (`AgentPage` component)

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: a correctly-connected `CopilotKitProvider` that `useAgentChat()` (`src/features/agent/hooks/use-agent-chat.ts`, unchanged) and Task 2's hook both rely on being mounted above them in the tree.

- [ ] **Step 1: Add the `@ag-ui/langgraph` dependency**

Run (from the `admin` directory):

```bash
npm install @ag-ui/langgraph
```

Expected: `package.json` gains `"@ag-ui/langgraph": "^0.0.42"` (or newer) under `dependencies`, and `package-lock.json` updates.

- [ ] **Step 2: Document the new env var in `.env.example`**

Read the current `.env.example` first (`VITE_COPILOTKIT_RUNTIME_URL=` is on line 10), then add directly below it:

```
VITE_COPILOTKIT_AGENT_ID=nexatech_agent
```

- [ ] **Step 3: Read the current `AgentPage` component**

Read `src/pages/admin/agent/index.tsx:867-885` to confirm the exact current text before editing (it should match):

```tsx
export default function AgentPage() {
  const backendBaseUrl = (import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:8080").replace(/\/$/, "");
  const configuredRuntimeUrl = (import.meta.env.VITE_COPILOTKIT_RUNTIME_URL || "").trim();
  const runtimeUrl = configuredRuntimeUrl || `${backendBaseUrl}/api/v1/agent/copilotkit`;
  const useAguiFlag = String(import.meta.env.VITE_USE_AGUI ?? "true").toLowerCase() !== "false";
  const accessToken = getAccessToken();
  const aguiEnabled = useAguiFlag && Boolean(accessToken);
  const providerHeaders = accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;

  if (!aguiEnabled) {
    return <AgentPageContent copilotKitEnabled={false} aguiChat={null} />;
  }

  return (
    <CopilotKitProvider runtimeUrl={runtimeUrl} headers={providerHeaders}>
      <AgentPageAguiContent copilotKitEnabled />
    </CopilotKitProvider>
  );
}
```

- [ ] **Step 4: Replace `runtimeUrl` with `selfManagedAgents` + `LangGraphHttpAgent`**

Add the import at the top of `src/pages/admin/agent/index.tsx`, alongside the existing `CopilotKitProvider` import:

```tsx
import { CopilotKitProvider } from "@copilotkit/react-core/v2";
import { LangGraphHttpAgent } from "@ag-ui/langgraph";
```

Add the `AGENT_ID` constant near the top of the file, alongside `DRAFT_STORAGE_KEY`:

```tsx
const DRAFT_STORAGE_KEY = "nexatech_admin_agent_draft_v1";
const AGENT_ID = (import.meta.env.VITE_COPILOTKIT_AGENT_ID || "nexatech_agent").trim();
```

Replace the `AgentPage` function body from Step 3 with:

```tsx
export default function AgentPage() {
  const backendBaseUrl = (import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:8080").replace(/\/$/, "");
  const configuredRuntimeUrl = (import.meta.env.VITE_COPILOTKIT_RUNTIME_URL || "").trim();
  const runtimeUrl = configuredRuntimeUrl || `${backendBaseUrl}/api/v1/agent/copilotkit`;
  const useAguiFlag = String(import.meta.env.VITE_USE_AGUI ?? "true").toLowerCase() !== "false";
  const accessToken = getAccessToken();
  const aguiEnabled = useAguiFlag && Boolean(accessToken);

  const agent = useMemo(() => {
    if (!aguiEnabled) return null;
    return new LangGraphHttpAgent({
      url: runtimeUrl,
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    });
  }, [aguiEnabled, runtimeUrl, accessToken]);

  if (!aguiEnabled || !agent) {
    return <AgentPageContent copilotKitEnabled={false} aguiChat={null} />;
  }

  return (
    <CopilotKitProvider selfManagedAgents={{ [AGENT_ID]: agent }}>
      <AgentPageAguiContent copilotKitEnabled />
    </CopilotKitProvider>
  );
}
```

`useMemo` is already imported at the top of this file (used elsewhere in `AgentPageContent`) — confirm the import line reads `import { useEffect, useMemo, useRef, useState } from "react";` and add nothing extra there.

- [ ] **Step 5: Type-check and lint**

Run:

```bash
npx tsc -b --noEmit
npx eslint src/pages/admin/agent/index.tsx
```

Expected: no errors. If `tsc` complains that `LangGraphHttpAgent`'s constructor doesn't accept `headers`, open `node_modules/@ag-ui/langgraph/dist/index.d.ts` and check the actual `AgentConfig`/`HttpAgentConfig` shape `LangGraphHttpAgent` inherits from `HttpAgent` — adjust the constructor call to match (e.g., `headers` may need to be a getter function instead of a plain object, matching the pattern already used for CopilotKit's own `headers` prop type: `Record<string, string> | (() => Record<string, string>)`).

- [ ] **Step 6: Manual verification (no automated test — protocol-level wiring)**

Start both servers:

```bash
cd /home/nguyen/Workspace/java/nexatech-backend/python-services/agent-service && uv run python3 main.py &
cd /home/nguyen/Workspace/java/nexatech-frontend/admin && npm run dev
```

In a real browser: log in, open the admin agent page, open DevTools → Console and Network tabs, send a chat message.

- **Pass:** no `"[AgentChat] CopilotKit unavailable, fallback to SSE"` warning in the console; Network tab shows a request to `/api/v1/agent/copilotkit` (not `/runs/stream`); the assistant responds.
- **If it still falls back:** read the actual thrown error from the console (the catch block in `use-agent-chat.ts:149-152` logs it in dev mode) and treat that as the next debugging input — do not guess further fixes without it.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json .env.example src/pages/admin/agent/index.tsx
git commit -m "fix(agent): connect CopilotKit directly to the Python AG-UI backend via selfManagedAgents

runtimeUrl expects a Node CopilotKit Runtime, which this stack doesn't
have — the backend serves raw AG-UI protocol directly via ag-ui-langgraph.
selfManagedAgents + LangGraphHttpAgent connects to that directly, which
is what silently failed before (useAgent() threw, app fell back to the
legacy SSE path)."
```

---

### Task 2: Generative UI for product/order/inventory tool calls

**Files:**
- Create: `src/features/agent/hooks/use-agent-generative-ui.ts`
- Modify: `src/pages/admin/agent/index.tsx` (`AgentPageAguiContent`, around line 856-865)

**Interfaces:**
- Consumes: `AgentProductCard` (`src/features/agent/components/agent-product-card.tsx`), `AgentOrderCard` (`agent-order-card.tsx`), `AgentInventoryTable` (`agent-inventory-table.tsx`) — all already exist, props are `{ data: unknown }` per their current usage in `agent-tool-call-card.tsx:32,36,40`.
- Produces: `useAgentGenerativeUI(): void` — a hook with no return value, registers renderers as a side effect. Must be called from inside a component that is a descendant of `CopilotKitProvider` (Task 1).

- [ ] **Step 1: Confirm the existing card components' prop shape**

Read `src/features/agent/components/agent-product-card.tsx`,
`agent-order-card.tsx`, and `agent-inventory-table.tsx` in full. Confirm each
exports a named function component accepting a single `data: unknown` (or
similarly loosely-typed) prop, matching how `agent-tool-call-card.tsx:32,36,40`
already calls them (`<AgentProductCard data={toolCall.result} />`, etc.). If
any component's prop type is narrower than `unknown`, note the exact prop
type here and match it in Step 2 instead of assuming `unknown`.

- [ ] **Step 2: Create `src/features/agent/hooks/use-agent-generative-ui.ts`**

```tsx
import { useRenderToolCall } from "@copilotkit/react-core/v2";
import { z } from "zod";
import { AgentProductCard } from "@/features/agent/components/agent-product-card";
import { AgentOrderCard } from "@/features/agent/components/agent-order-card";
import { AgentInventoryTable } from "@/features/agent/components/agent-inventory-table";

const PRODUCT_TOOL_NAMES = [
  "get_product_by_id",
  "get_product_by_slug",
  "list_products",
  "search_products",
  "list_featured_products",
  "list_products_by_tags",
  "list_products_by_category",
  "list_products_by_category_slug",
  "get_related_products",
  "get_related_products_by_slug",
] as const;

const ORDER_TOOL_NAMES = [
  "get_order",
  "get_my_orders",
  "get_order_stats",
  "get_order_trace",
] as const;

const INVENTORY_TOOL_NAMES = [
  "list_inventory",
  "get_inventory",
  "get_inventory_movements",
  "check_inventory",
  "get_low_stock_items",
] as const;

const TOOL_ARGS_SCHEMA = z.record(z.string(), z.unknown());

function parseToolResult(result: string | undefined): unknown {
  if (!result) return undefined;
  try {
    return JSON.parse(result);
  } catch {
    return result;
  }
}

/**
 * Registers generative-UI renderers for tool calls the backend already
 * executes (product/order/inventory lookups via MCP), so their results show
 * as the existing card components instead of raw JSON in the chat.
 *
 * Must be called from a component mounted under CopilotKitProvider.
 */
export function useAgentGenerativeUI(): void {
  for (const name of PRODUCT_TOOL_NAMES) {
    // Looping over a fixed, compile-time-constant array of hook calls:
    // same length/order every render, so Rules of Hooks holds in practice
    // even though the linter can't statically prove it.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useRenderToolCall({
      name,
      args: TOOL_ARGS_SCHEMA,
      render: ({ status, result }) =>
        status !== "complete" ? null : <AgentProductCard data={parseToolResult(result)} />,
    });
  }

  for (const name of ORDER_TOOL_NAMES) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useRenderToolCall({
      name,
      args: TOOL_ARGS_SCHEMA,
      render: ({ status, result }) =>
        status !== "complete" ? null : <AgentOrderCard data={parseToolResult(result)} />,
    });
  }

  for (const name of INVENTORY_TOOL_NAMES) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useRenderToolCall({
      name,
      args: TOOL_ARGS_SCHEMA,
      render: ({ status, result }) =>
        status !== "complete" ? null : <AgentInventoryTable data={parseToolResult(result)} />,
    });
  }
}
```

If Step 1 found a narrower prop type than `unknown` for any card component,
change `parseToolResult`'s return type usage at that call site to match
(e.g. cast or adjust `parseToolResult`'s signature) rather than loosening the
component's own prop type.

- [ ] **Step 3: Wire the hook into `AgentPageAguiContent`**

Read `src/pages/admin/agent/index.tsx` around lines 856-865 to confirm current text:

```tsx
function AgentPageAguiContent({ copilotKitEnabled }: { copilotKitEnabled: boolean }) {
  const agui = useAgentChat();

  return (
    <AgentPageContent
      copilotKitEnabled={copilotKitEnabled}
      aguiChat={agui}
    />
  );
}
```

Add the import at the top of the file:

```tsx
import { useAgentGenerativeUI } from "@/features/agent/hooks/use-agent-generative-ui";
```

Replace the function body:

```tsx
function AgentPageAguiContent({ copilotKitEnabled }: { copilotKitEnabled: boolean }) {
  useAgentGenerativeUI();
  const agui = useAgentChat();

  return (
    <AgentPageContent
      copilotKitEnabled={copilotKitEnabled}
      aguiChat={agui}
    />
  );
}
```

- [ ] **Step 4: Type-check and lint**

Run:

```bash
npx tsc -b --noEmit
npx eslint src/features/agent/hooks/use-agent-generative-ui.ts src/pages/admin/agent/index.tsx
```

Expected: no errors.

- [ ] **Step 5: Manual verification**

With both servers running (Task 1, Step 6) and the connection confirmed
working: ask the agent a question that resolves to a product lookup (e.g.
"cho tôi xem sản phẩm CPU Intel Core i5 12400F" or "liệt kê sản phẩm").

- **Pass:** the response shows the `AgentProductCard` layout (image, price,
  stock status — matching what `agent-tool-call-card.tsx`'s `resultView`
  already renders for the legacy SSE path) instead of a raw JSON blob or
  CopilotKit's default tool-call text.
- **If nothing renders:** check the DevTools console for a Zod validation
  error from `useRenderToolCall`'s `args` schema mismatch, and check that the
  tool name the backend actually selected (visible in the agent-service logs,
  `[CHAT] incoming=... tools=[...]`) matches one of the arrays in Step 2
  exactly — tool names are case-sensitive and must match verbatim.

- [ ] **Step 6: Commit**

```bash
git add src/features/agent/hooks/use-agent-generative-ui.ts src/pages/admin/agent/index.tsx
git commit -m "feat(agent): render product/order/inventory tool calls as cards via CopilotKit generative UI

Reuses the existing AgentProductCard/AgentOrderCard/AgentInventoryTable
components (already built for the legacy SSE tool-call view) instead of
building new ones — useRenderToolCall wires them to the AG-UI tool names
the backend already returns."
```

---

## Self-Review Notes

- **Coverage:** Spec's Component 1 → Task 1. Component 2 → Task 2. HITL is explicitly out of scope for both the spec and this plan (Non-goals section) — no task needed.
- **Placeholder scan:** no TBD/TODO; both tasks show complete code for every step.
- **Type consistency:** `useAgentGenerativeUI(): void` signature in Task 2 matches its call site in Task 2 Step 3 (`useAgentGenerativeUI();`, no destructured return value used). `AGENT_ID` constant (Task 1 Step 4) is a plain string key, matching how it's used as a computed object key `{ [AGENT_ID]: agent }` in the same step — no mismatch with Task 2, which doesn't reference `AGENT_ID`.
- **Known risk flagged inline:** Task 1 Step 5 anticipates `LangGraphHttpAgent`'s constructor shape may not exactly match the guessed `{ url, headers }` — instructs checking the installed package's `.d.ts` rather than guessing further, consistent with not having empirically run this integration yet.
