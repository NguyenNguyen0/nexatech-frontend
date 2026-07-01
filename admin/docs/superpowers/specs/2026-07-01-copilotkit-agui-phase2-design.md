# CopilotKit / AG-UI Phase 2 Design

## Goal

Make the admin agent chat page actually run on CopilotKit v2 + AG-UI against
the existing Python `agent-service` backend (no Node.js layer), and add
generative UI rendering for tool calls that already exist backend-side
(product/order/inventory lookups), reusing the card components already built
for the legacy SSE path.

## Background / root cause

The previous CopilotKit setup never worked. Root cause found by reading the
installed `@copilotkit/react-core` v2 API and its docs: `CopilotKitProvider`
was configured with `runtimeUrl` (`src/pages/admin/agent/index.tsx:881`),
which is for connecting to a **CopilotKit Runtime** (a Node/Hono service via
`createCopilotEndpoint`). Our backend has no such layer — it exposes a raw
AG-UI protocol endpoint directly via Python's `ag-ui-langgraph`
(`add_langgraph_fastapi_endpoint` + `LangGraphAGUIAgent`, see
`agent-service/app/runtime/copilotkit.py`). Pointing `runtimeUrl` at a raw
AG-UI endpoint is a protocol mismatch — the client never got a response it
understood, `useAgent()` threw, and `use-agent-chat.ts`'s try/catch silently
fell back to the legacy SSE path. That's why the app "looked like" it worked
(SSE fallback) while CopilotKit itself never connected.

The correct way to connect directly to a self-hosted AG-UI backend without a
Node runtime is `selfManagedAgents` (or the dev-only `agents__unsafe_dev_only`
alias) with an `AbstractAgent` instance — concretely `LangGraphHttpAgent`
from the `@ag-ui/langgraph` npm package (a thin `HttpAgent` subclass; verified
by unpacking the published package — as of `0.0.42` it adds no extra
behavior over `HttpAgent`, so it's a safe drop-in, and using the
LangGraph-named class future-proofs against version bumps that DO add
LangGraph-specific handling).

## Scope for this implementation pass

Two components are implemented now (high confidence, fully specified):

1. **Fix the connection** — swap `runtimeUrl` for `selfManagedAgents` +
   `LangGraphHttpAgent`.
2. **Generative UI for existing tool calls** — `useRenderToolCall` wired to
   the existing `AgentProductCard` / `AgentOrderCard` / `AgentInventoryTable`
   components, keyed by tool name.

**HITL (human-in-the-loop approval UI) is explicitly deferred**, not
implemented in this pass. Reason: the backend's `interrupt_caller` node
triggers a LangGraph `interrupt()`, which `ag-ui-langgraph` (Python) forwards
as a custom AG-UI event named `"on_interrupt"` (confirmed by reading
`ag_ui_langgraph/agent.py`). Neither `@ag-ui/client` nor `@ag-ui/langgraph`
(JS) were found to contain code that translates that specific custom event
into the state `useHumanInTheLoop` consumes — this could only be confirmed
empirically (running both servers, triggering a sensitive tool call, and
inspecting the actual event stream), not from static reading alone. HITL
depends on the connection fix (component 1) already working, so it is a
follow-up investigation once components 1–2 are verified live, not part of
this batch.

The legacy SSE path (`/runs`, `/runs/stream`, `streamAgentResponse`) stays
untouched as a fallback, per explicit decision.

## Component 1: Fix the CopilotKit connection

**Files:**
- `package.json` — add `@ag-ui/langgraph` dependency.
- `src/pages/admin/agent/index.tsx` — replace `runtimeUrl`/`headers` props
  on `CopilotKitProvider` with `selfManagedAgents`.

**Before:**
```tsx
<CopilotKitProvider runtimeUrl={runtimeUrl} headers={providerHeaders}>
  <AgentPageAguiContent copilotKitEnabled />
</CopilotKitProvider>
```

**After:**
```tsx
const agent = useMemo(
  () =>
    new LangGraphHttpAgent({
      url: runtimeUrl,
      headers: providerHeaders,
    }),
  [runtimeUrl, providerHeaders],
);

<CopilotKitProvider selfManagedAgents={{ [AGENT_ID]: agent }}>
  <AgentPageAguiContent copilotKitEnabled />
</CopilotKitProvider>
```

`AGENT_ID` is a new top-level constant `"nexatech_agent"` in `index.tsx`,
matching the backend's `SETTINGS.agui_agent_name` default
(`agent-service/app/core/settings.py`). There's no existing frontend env var
for this — add one (`VITE_COPILOTKIT_AGENT_ID`, defaulting to
`"nexatech_agent"`) next to `VITE_COPILOTKIT_RUNTIME_URL` in `.env.example`,
same pattern already used for the runtime URL override.

`runtimeUrl` local variable computation stays the same (still the URL of the
backend's AG-UI endpoint) — only the prop it's passed into changes.

**Verification:** this is protocol-level wiring; unit tests have no value
here. Verification is: start the Vite dev server + the Python agent-service,
open the admin agent page in a real browser, log in, send 2+ chat messages in
the same conversation, and confirm in devtools Network tab that requests hit
`/api/v1/agent/copilotkit` (not `/runs/stream`), and that `use-agent-chat.ts`'s
`isReady` is `true` (i.e., the dev console warning `"[AgentChat] CopilotKit
unavailable, fallback to SSE"` does NOT appear).

## Component 2: Generative UI for tool calls

**Files:**
- Create: `src/features/agent/hooks/use-agent-generative-ui.ts`
- Modify: `src/pages/admin/agent/index.tsx` — call the new hook inside
  `AgentPageAguiContent`.

Reuses the existing components verbatim — no new card components:
`AgentProductCard`, `AgentOrderCard`, `AgentInventoryTable`,
`AgentJsonFallback` (already in `src/features/agent/components/`).

```tsx
// use-agent-generative-ui.ts
import { useRenderToolCall } from "@copilotkit/react-core/v2";
import { z } from "zod";
import { AgentProductCard } from "@/features/agent/components/agent-product-card";
import { AgentOrderCard } from "@/features/agent/components/agent-order-card";
import { AgentInventoryTable } from "@/features/agent/components/agent-inventory-table";
import { AgentJsonFallback } from "@/features/agent/components/agent-json-fallback";

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

function parseResult(result: string | undefined): unknown {
  if (!result) return undefined;
  try {
    return JSON.parse(result);
  } catch {
    return result;
  }
}

export function useAgentGenerativeUI() {
  for (const name of PRODUCT_TOOL_NAMES) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useRenderToolCall({
      name,
      args: z.record(z.unknown()),
      render: ({ status, result }) =>
        status !== "complete" ? null : <AgentProductCard data={parseResult(result)} />,
    });
  }

  for (const name of ORDER_TOOL_NAMES) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useRenderToolCall({
      name,
      args: z.record(z.unknown()),
      render: ({ status, result }) =>
        status !== "complete" ? null : <AgentOrderCard data={parseResult(result)} />,
    });
  }

  for (const name of INVENTORY_TOOL_NAMES) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useRenderToolCall({
      name,
      args: z.record(z.unknown()),
      render: ({ status, result }) =>
        status !== "complete" ? null : <AgentInventoryTable data={parseResult(result)} />,
    });
  }
}
```

Calling a hook in a loop over a **compile-time-constant** array is safe here
(same array, same length, same order every render — satisfies the Rules of
Hooks in spirit even though the linter can't prove it statically, hence the
disable comment). This mirrors `AgentToolCallCard`'s existing
`lowerName.includes("product")`/`"order"`/`"inventory"` dispatch, just
declared per-tool instead of guessed from a substring match — an improvement
in precision, not a new pattern.

**Verification:** same live-browser method as Component 1 — ask a question
that resolves to `get_product_by_id`/`list_products` and confirm a
`AgentProductCard` renders inline in the chat instead of raw JSON.

## Non-goals for this pass

- HITL wiring (deferred, see above).
- Removing the legacy SSE path (explicit decision: keep as fallback).
- Redesigning `AgentProductCard`/`AgentOrderCard`/`AgentInventoryTable`
  visually (explicit decision: reuse as-is).
