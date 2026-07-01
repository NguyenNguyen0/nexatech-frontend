import { defineToolCallRenderer } from "@copilotkit/react-core/v2";
import { ToolCallStatus } from "@copilotkit/core";
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

/**
 * Static tool-call renderers for the tool calls the backend already
 * executes (product/order/inventory lookups via MCP), so their results show
 * as the existing card components instead of raw JSON in the chat.
 *
 * Passed to `<CopilotKitProvider renderToolCalls={AGENT_TOOL_CALL_RENDERERS}>`.
 */
export const AGENT_TOOL_CALL_RENDERERS = [
  ...PRODUCT_TOOL_NAMES.map((name) =>
    defineToolCallRenderer({
      name,
      args: TOOL_ARGS_SCHEMA,
      render: ({ status, result }) =>
        status !== ToolCallStatus.Complete ? <></> : <AgentProductCard data={JSON.parse(result)} />,
    }),
  ),
  ...ORDER_TOOL_NAMES.map((name) =>
    defineToolCallRenderer({
      name,
      args: TOOL_ARGS_SCHEMA,
      render: ({ status, result }) =>
        status !== ToolCallStatus.Complete ? <></> : <AgentOrderCard data={JSON.parse(result)} />,
    }),
  ),
  ...INVENTORY_TOOL_NAMES.map((name) =>
    defineToolCallRenderer({
      name,
      args: TOOL_ARGS_SCHEMA,
      render: ({ status, result }) =>
        status !== ToolCallStatus.Complete ? <></> : <AgentInventoryTable data={JSON.parse(result)} />,
    }),
  ),
];
