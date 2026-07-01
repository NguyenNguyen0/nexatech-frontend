/**
 * MCP tool results come back as `{ success: boolean, data: <payload> }`, and
 * list endpoints paginate `<payload>` as `{ content: [...], ... }` (Spring
 * Data page serialization). Card components need the actual array/object,
 * not the envelope — this peels off the `success`/`data` wrapper.
 */
export function unwrapMcpResult(data: unknown): unknown {
  if (typeof data === "object" && data !== null) {
    const record = data as Record<string, unknown>;
    if (typeof record.success === "boolean" && record.data !== undefined) {
      return record.data;
    }
  }
  return data;
}
