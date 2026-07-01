import { useEffect, useMemo, useRef, useState } from "react";
import { IconSparkles } from "@tabler/icons-react";
import { CopilotKitProvider, CopilotChatMessageView } from "@copilotkit/react-core/v2";
import "@copilotkit/react-core/v2/styles.css";
import { LangGraphHttpAgent } from "@ag-ui/langgraph";
import { v4 as uuidv4 } from "uuid";
import type { Message } from "@ag-ui/core";
import { Layout } from "@/components/custom/layout";
import useLocalStorage from "@/hooks/use-local-storage";
import { useAgentChat } from "@/features/agent/hooks/use-agent-chat";
import { AGENT_TOOL_CALL_RENDERERS } from "@/features/agent/hooks/agent-generative-ui-renderers";
import { AgentComposer } from "@/features/agent/components/agent-composer";
import { AgentConversationList } from "@/features/agent/components/agent-conversation-list";
import {
  deleteAgentSession,
  getAgentConversationDetail,
  listAgentConversations,
  updateAgentSessionTitle,
} from "@/features/agent/services/agentApi";
import type { AgentChatMessage, AgentConversation, AgentConversationSummary } from "@/features/agent/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { getAccessToken } from "@/services/authSession";
import { toast } from "sonner";

const DRAFT_STORAGE_KEY = "nexatech_admin_agent_draft_v1";
const AGENT_ID = (import.meta.env.VITE_COPILOTKIT_AGENT_ID || "nexatech_agent").trim();

function nowIso(): string {
  return new Date().toISOString();
}

function toSummary(conversation: AgentConversation): AgentConversationSummary {
  const lastMessage = conversation.messages[conversation.messages.length - 1];
  const preview = lastMessage?.content?.trim() || "";
  return {
    id: conversation.id,
    title: conversation.title,
    updatedAt: conversation.updatedAt,
    preview: preview.slice(0, 120),
  };
}

/**
 * Converts our Mongo-persisted message shape into real AG-UI messages, so a
 * live agent instance can be seeded with a conversation's prior history
 * (agent.setMessages) before the user continues chatting in it.
 */
function toAgUiMessages(messages: AgentChatMessage[]): Message[] {
  const result: Message[] = [];

  for (const message of messages) {
    if (message.role === "user") {
      result.push({ id: message.id, role: "user", content: message.content } as Message);
      continue;
    }

    const toolCalls = (message.toolCalls ?? []).map((toolCall) => ({
      id: toolCall.id,
      type: "function" as const,
      function: { name: toolCall.name, arguments: JSON.stringify(toolCall.args ?? {}) },
    }));

    result.push({
      id: message.id,
      role: "assistant",
      content: message.content || "",
      ...(toolCalls.length > 0 ? { toolCalls } : {}),
    } as Message);

    for (const toolCall of message.toolCalls ?? []) {
      result.push({
        id: `${toolCall.id}-result`,
        role: "tool",
        toolCallId: toolCall.id,
        content: typeof toolCall.result === "string" ? toolCall.result : JSON.stringify(toolCall.result ?? {}),
      } as Message);
    }
  }

  return result;
}

function getAgentErrorMessage(error: unknown): string {
  if (error instanceof TypeError) {
    return "Khong ket noi duoc den agent service. Kiem tra mang hoac backend roi thu lai.";
  }
  if (error instanceof Error) {
    const detail = error.message.trim();
    return detail || "Agent service khong phan hoi. Vui long thu lai.";
  }
  return "Agent service khong phan hoi. Vui long thu lai.";
}

function AgentPageContent() {
  const aguiChat = useAgentChat();

  const [conversations, setConversations] = useState<AgentConversation[]>([]);
  const [draft, setDraft] = useLocalStorage<string>({ key: DRAFT_STORAGE_KEY, defaultValue: "" });
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(true);
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(false);
  const loadedConversationDetailRef = useRef<Set<string>>(new Set());
  const seededConversationIdRef = useRef<string | null>(null);

  useEffect(() => {
    void loadConversationSummaries();
  }, []);

  const sortedSummaries = useMemo(
    () => [...conversations].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).map(toSummary),
    [conversations],
  );

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) ?? null,
    [conversations, activeConversationId],
  );

  function seedAgent(conversationId: string, history: AgentChatMessage[]) {
    if (!aguiChat.isReady) return;
    aguiChat.agent.threadId = conversationId;
    aguiChat.agent.setMessages(toAgUiMessages(history));
    seededConversationIdRef.current = conversationId;
  }

  async function loadConversationSummaries() {
    setIsLoadingHistory(true);
    try {
      const summaries = await listAgentConversations(20);
      setConversations((current) => {
        const currentMap = new Map(current.map((item) => [item.id, item]));
        const summaryIds = new Set(summaries.map((summary) => summary.id));
        const serverConversations = summaries.map((summary) => {
          const existing = currentMap.get(summary.id);
          return {
            id: summary.id,
            title: summary.title,
            createdAt: existing?.createdAt || summary.updatedAt,
            updatedAt: summary.updatedAt,
            messages: existing?.messages || [],
          };
        });
        const optimisticConversations = current.filter(
          (conversation) => !summaryIds.has(conversation.id) && conversation.messages.length > 0,
        );
        return [...serverConversations, ...optimisticConversations].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Khong the tai danh sach hoi thoai");
    } finally {
      setIsLoadingHistory(false);
    }
  }

  async function loadConversationDetail(threadId: string) {
    try {
      const detail = await getAgentConversationDetail(threadId, 100);
      loadedConversationDetailRef.current.add(threadId);
      upsertConversation(detail);
      if (activeConversationId === threadId) {
        seedAgent(threadId, detail.messages);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Khong the tai chi tiet hoi thoai");
    }
  }

  function upsertConversation(conversation: AgentConversation) {
    setConversations((current) => {
      const index = current.findIndex((item) => item.id === conversation.id);
      if (index < 0) return [conversation, ...current].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      const next = [...current];
      next[index] = conversation;
      return next.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    });
  }

  function renameConversationLocal(conversationId: string, title: string) {
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === conversationId ? { ...conversation, title, updatedAt: nowIso() } : conversation,
      ),
    );
  }

  function removeConversationLocal(conversationId: string) {
    setConversations((current) => current.filter((conversation) => conversation.id !== conversationId));
  }

  async function handleRenameConversation(conversationId: string) {
    const conversation = conversations.find((item) => item.id === conversationId);
    if (!conversation) return;

    const nextTitle = window.prompt("Nhap ten moi cho hoi thoai:", conversation.title);
    if (!nextTitle || !nextTitle.trim() || nextTitle.trim() === conversation.title) return;

    try {
      await updateAgentSessionTitle(conversationId, nextTitle.trim());
      renameConversationLocal(conversationId, nextTitle.trim());
      toast.success("Da cap nhat ten hoi thoai");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Khong the cap nhat ten hoi thoai");
    }
  }

  async function handleDeleteConversation(conversationId: string) {
    const conversation = conversations.find((item) => item.id === conversationId);
    if (!conversation) return;

    const accepted = window.confirm(`Xoa hoi thoai "${conversation.title}"?`);
    if (!accepted) return;

    try {
      await deleteAgentSession(conversationId);
      removeConversationLocal(conversationId);
      setActiveConversationId((current) => (current === conversationId ? null : current));
      toast.success("Da xoa hoi thoai");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Khong the xoa hoi thoai");
    }
  }

  function selectConversation(conversationId: string) {
    setActiveConversationId(conversationId);
    setMobileHistoryOpen(false);

    const existing = conversations.find((item) => item.id === conversationId);
    seedAgent(conversationId, existing?.messages ?? []);

    if (!loadedConversationDetailRef.current.has(conversationId)) {
      void loadConversationDetail(conversationId);
    }
  }

  function createNewConversation() {
    const conversationId = uuidv4();
    const now = nowIso();
    upsertConversation({ id: conversationId, title: "Hoi thoai moi", createdAt: now, updatedAt: now, messages: [] });
    setActiveConversationId(conversationId);
    setMobileHistoryOpen(false);
    loadedConversationDetailRef.current.add(conversationId);
    seedAgent(conversationId, []);
  }

  async function handleSend() {
    const prompt = draft.trim();
    if (!prompt || !aguiChat.isReady) return;

    let conversationId = activeConversationId;
    if (!conversationId) {
      conversationId = uuidv4();
      const now = nowIso();
      upsertConversation({ id: conversationId, title: prompt.slice(0, 40), createdAt: now, updatedAt: now, messages: [] });
      setActiveConversationId(conversationId);
      loadedConversationDetailRef.current.add(conversationId);
      seedAgent(conversationId, []);
    } else if (seededConversationIdRef.current !== conversationId) {
      seedAgent(conversationId, activeConversation?.messages ?? []);
    }

    setDraft("");
    setIsSending(true);
    try {
      await aguiChat.sendMessage(prompt);
      void loadConversationSummaries();
    } catch (error) {
      toast.error(getAgentErrorMessage(error));
    } finally {
      setIsSending(false);
    }
  }

  function handleSubmitOrCancel() {
    if (isRunning) {
      aguiChat.stopGeneration();
      setIsSending(false);
      return;
    }
    void handleSend();
  }

  const isRunning = Boolean(aguiChat.isReady && aguiChat.agent.isRunning) || isSending;
  const hasActiveConversation = Boolean(activeConversationId);

  function renderEmptyState() {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <img src="/nexatech.png" alt="NexaTech" className="h-16 w-16 rounded-lg" />
        <h2 className="text-xl font-semibold">NexaTech Agent</h2>
        <p className="max-w-lg text-sm text-muted-foreground">
          Tro ly AI cho admin panel, ho tro tra cuu du lieu, goi y hanh dong, va cho phep quy trinh xac nhan HITL.
        </p>
        <p className="text-xs text-muted-foreground">Thu prompt: "Tong hop doanh thu 7 ngay va de xuat chuong trinh khuyen mai"</p>
      </div>
    );
  }

  return (
    <Layout fixed>
      <Layout.Body className="h-full px-0 py-0 md:px-0">
        <div className="flex h-full min-h-0 flex-col md:flex-row">
          <div className={cn("h-60 md:h-full", mobileHistoryOpen ? "block" : "hidden md:block")}>
            <AgentConversationList
              conversations={sortedSummaries}
              activeConversationId={activeConversationId}
              onCreateConversation={createNewConversation}
              onSelectConversation={selectConversation}
              isCollapsed={isHistoryCollapsed}
              onToggleCollapsed={() => setIsHistoryCollapsed((value) => !value)}
              onRenameConversation={handleRenameConversation}
              onDeleteConversation={handleDeleteConversation}
            />
          </div>

          <section className="flex min-h-0 flex-1 flex-col">
            <div className="flex items-center justify-between border-b px-4 py-3 md:hidden">
              <button
                type="button"
                className="text-xs font-medium text-primary"
                onClick={() => setMobileHistoryOpen((open) => !open)}
              >
                {mobileHistoryOpen ? "An history" : "Mo history"}
              </button>
              <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <IconSparkles size={14} />
                AG-UI
              </div>
            </div>

            {isLoadingHistory && (
              <p className="px-4 pt-2 text-xs text-muted-foreground">Dang tai conversation history...</p>
            )}

            {!aguiChat.isReady ? (
              <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-muted-foreground">
                Khong the ket noi agent service. Vui long tai lai trang.
              </div>
            ) : !hasActiveConversation ? (
              renderEmptyState()
            ) : (
              <ScrollArea className="min-h-0 flex-1">
                <div className="mx-auto w-full max-w-5xl px-4 py-4">
                  <CopilotChatMessageView messages={aguiChat.agent.messages} isRunning={isRunning} />
                </div>
              </ScrollArea>
            )}

            <AgentComposer
              value={draft}
              isStreaming={isRunning}
              onChange={setDraft}
              onSubmitOrCancel={handleSubmitOrCancel}
            />
          </section>
        </div>
      </Layout.Body>
    </Layout>
  );
}

export default function AgentPage() {
  const backendBaseUrl = (import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:8080").replace(/\/$/, "");
  const configuredRuntimeUrl = (import.meta.env.VITE_COPILOTKIT_RUNTIME_URL || "").trim();
  const runtimeUrl = configuredRuntimeUrl || `${backendBaseUrl}/api/v1/agent/copilotkit`;
  const accessToken = getAccessToken();

  const agent = useMemo(() => {
    if (!accessToken) return null;
    return new LangGraphHttpAgent({
      url: runtimeUrl,
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }, [runtimeUrl, accessToken]);

  if (!agent) {
    return (
      <Layout fixed>
        <Layout.Body className="flex h-full items-center justify-center">
          <p className="text-sm text-muted-foreground">Phien dang nhap khong hop le. Vui long dang nhap lai.</p>
        </Layout.Body>
      </Layout>
    );
  }

  return (
    <CopilotKitProvider selfManagedAgents={{ [AGENT_ID]: agent }} renderToolCalls={AGENT_TOOL_CALL_RENDERERS}>
      <AgentPageContent />
    </CopilotKitProvider>
  );
}
