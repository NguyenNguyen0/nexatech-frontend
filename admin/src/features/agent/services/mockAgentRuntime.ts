import type { AgentRunCallbacks, AgentToolCall } from "@/features/agent/types";

function wait(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);

    const onAbort = () => {
      clearTimeout(timeout);
      reject(new DOMException("Agent run aborted", "AbortError"));
    };

    signal.addEventListener("abort", onAbort, { once: true });
  });
}

function nowIso(): string {
  return new Date().toISOString();
}

function cloneTool(tool: AgentToolCall): AgentToolCall {
  return { ...tool, args: { ...tool.args } };
}

export async function runMockAgentStream(
  prompt: string,
  callbacks: AgentRunCallbacks,
  signal: AbortSignal,
): Promise<void> {
  const tools: AgentToolCall[] = [
    {
      id: "tool-promotions",
      name: "list_promotions",
      args: { limit: 5, status: "active" },
      state: "pending",
      startedAt: nowIso(),
    },
    {
      id: "tool-revenue",
      name: "get_revenue_stats",
      args: { range: "30d" },
      state: "pending",
      startedAt: nowIso(),
    },
  ];

  callbacks.onToolCallUpdate(cloneTool(tools[0]));
  await wait(350, signal);
  tools[0].state = "completed";
  tools[0].finishedAt = nowIso();
  callbacks.onToolCallUpdate(cloneTool(tools[0]));

  callbacks.onUICard({
    id: `hitl-${Date.now()}`,
    type: "hitl",
    title: "Yeu cau xac nhan",
    description: "Can duyet publishing ban tin khuyen mai truoc khi thuc thi.",
    payload: {
      action: "create_news_article",
      allowedDecisions: ["approve", "reject", "edit"],
    },
  });

  callbacks.onToolCallUpdate(cloneTool(tools[1]));
  await wait(550, signal);
  tools[1].state = "completed";
  tools[1].finishedAt = nowIso();
  callbacks.onToolCallUpdate(cloneTool(tools[1]));

  callbacks.onUICard({
    id: `chart-${Date.now()}`,
    type: "chart",
    title: "Revenue Snapshot",
    description: "Bieu do doanh thu 7 ngay gan nhat (mock data).",
    payload: {
      points: [120, 145, 132, 178, 166, 201, 226],
      labels: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
    },
  });

  callbacks.onUICard({
    id: `canvas-${Date.now()}`,
    type: "news-canvas",
    title: "News Canvas",
    description: "Canvas tao draft bai viet sale, san sang de noi voi generative UI that.",
    payload: {
      template: "promotion-news",
      fields: ["title", "summary", "cta"],
    },
  });

  const response = `Da nhan prompt: **${prompt.trim()}**\n\n`
    + "Toi da tong hop nhanh du lieu tu cac cong cu va de xuat 3 buoc tiep theo:\n"
    + "1. Kiem tra danh sach khuyen mai dang active.\n"
    + "2. Xac nhan noi dung ban tin truoc khi publish (HITL).\n"
    + "3. Xem nhanh xu huong doanh thu truoc khi mo flash sale.\n\n"
    + "Ban co muon toi tao draft thong bao khuyen mai theo tone thuong hieu NexaTech khong?";

  for (const token of response.split(" ")) {
    if (signal.aborted) {
      throw new DOMException("Agent run aborted", "AbortError");
    }
    callbacks.onTextDelta(`${token} `);
    await wait(45, signal);
  }
}
