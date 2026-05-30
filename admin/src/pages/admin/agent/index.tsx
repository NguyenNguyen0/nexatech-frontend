import { useEffect, useMemo, useRef, useState } from "react";
import { IconSparkles } from "@tabler/icons-react";
import { CopilotKitProvider } from "@copilotkit/react-core/v2";
import { Layout } from "@/components/custom/layout";
import useLocalStorage from "@/hooks/use-local-storage";
import { AgentComposer } from "@/features/agent/components/agent-composer";
import { AgentConversationList } from "@/features/agent/components/agent-conversation-list";
import { AgentMarkdown } from "@/features/agent/components/agent-markdown";
import { AgentToolCallCard } from "@/features/agent/components/agent-tool-call-card";
import { AgentUICardView } from "@/features/agent/components/agent-ui-card";
import {
  cancelAgentRun,
  deleteAgentSession,
  getAgentConversationDetail,
  listAgentConversations,
  resumeAgentRun,
  startAgentRunStream,
  updateAgentSessionTitle,
} from "@/features/agent/services/agentApi";
import type {
  AgentChatMessage,
  AgentConversation,
  AgentConversationSummary,
  AgentToolCall,
  AgentUICard,
} from "@/features/agent/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const DRAFT_STORAGE_KEY = "nexatech_admin_agent_draft_v1";

function nowIso(): string {
  return new Date().toISOString();
}

function createConversation(title = "Hoi thoai moi"): AgentConversation {
  const now = nowIso();
  return {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
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

export default function AgentPage() {
  const runtimeUrl = (import.meta.env.VITE_COPILOTKIT_RUNTIME_URL || "").trim();
  const copilotKitEnabled = runtimeUrl.length > 0;
  const [conversations, setConversations] = useState<AgentConversation[]>([]);
  const [draft, setDraft] = useLocalStorage<string>({
    key: DRAFT_STORAGE_KEY,
    defaultValue: "",
  });
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(true);
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const runTrackingRef = useRef<{ runId?: string; threadId?: string }>({});
  const loadedConversationDetailRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    void loadConversationSummaries();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [conversations, activeConversationId]);

  const sortedSummaries = useMemo(
    () => [...conversations].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).map(toSummary),
    [conversations],
  );

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) ?? null,
    [conversations, activeConversationId],
  );

  async function loadConversationSummaries() {
    setIsLoadingHistory(true);
    try {
      const summaries = await listAgentConversations(20);
      setConversations((current) => {
        const currentMap = new Map(current.map((item) => [item.id, item]));
        return summaries.map((summary) => {
          const existing = currentMap.get(summary.id);
          return {
            id: summary.id,
            title: summary.title,
            createdAt: existing?.createdAt || summary.updatedAt,
            updatedAt: summary.updatedAt,
            messages: existing?.messages || [],
          };
        });
      });

      setActiveConversationId((current) => {
        if (current) return current;
        return summaries[0]?.id ?? null;
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Khong the tai danh sach hoi thoai";
      toast.error(message);
    } finally {
      setIsLoadingHistory(false);
    }
  }

  async function loadConversationDetail(threadId: string) {
    if (!threadId || threadId.startsWith("local-")) return;

    try {
      const detail = await getAgentConversationDetail(threadId, 100);
      loadedConversationDetailRef.current.add(threadId);
      upsertConversation(detail);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Khong the tai chi tiet hoi thoai";
      toast.error(message);
    }
  }

  useEffect(() => {
    if (!activeConversationId || activeConversationId.startsWith("local-")) return;
    if (loadedConversationDetailRef.current.has(activeConversationId)) return;
    void loadConversationDetail(activeConversationId);
  }, [activeConversationId]);

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
        conversation.id === conversationId
          ? { ...conversation, title, updatedAt: nowIso() }
          : conversation,
      ),
    );
  }

  function removeConversationLocal(conversationId: string) {
    setConversations((current) => current.filter((conversation) => conversation.id !== conversationId));
  }

  function migrateConversationId(fromId: string, toId: string) {
    if (fromId === toId) return;

    setConversations((current) => {
      const existing = current.find((item) => item.id === fromId);
      if (!existing) return current;

      const withoutFrom = current.filter((item) => item.id !== fromId && item.id !== toId);
      return [
        {
          ...existing,
          id: toId,
          updatedAt: nowIso(),
        },
        ...withoutFrom,
      ].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    });

    setActiveConversationId((current) => (current === fromId ? toId : current));
  }

  function updateMessage(
    conversationId: string,
    messageId: string,
    updater: (message: AgentChatMessage) => AgentChatMessage,
  ) {
    setConversations((current) =>
      current.map((conversation) => {
        if (conversation.id !== conversationId) return conversation;
        return {
          ...conversation,
          updatedAt: nowIso(),
          messages: conversation.messages.map((message) =>
            message.id === messageId ? updater(message) : message,
          ),
        };
      }),
    );
  }

  function createNewConversation() {
    setActiveConversationId(null);
    setMobileHistoryOpen(false);
  }

  async function handleRenameConversation(conversationId: string) {
    if (conversationId.startsWith("local-")) {
      toast.info("Hoi thoai moi chua duoc luu tren server.");
      return;
    }

    const conversation = conversations.find((item) => item.id === conversationId);
    if (!conversation) return;

    const nextTitle = window.prompt("Nhap ten moi cho hoi thoai:", conversation.title);
    if (!nextTitle || !nextTitle.trim() || nextTitle.trim() === conversation.title) return;

    try {
      await updateAgentSessionTitle(conversationId, nextTitle.trim());
      renameConversationLocal(conversationId, nextTitle.trim());
      toast.success("Da cap nhat ten hoi thoai");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Khong the cap nhat ten hoi thoai";
      toast.error(message);
    }
  }

  async function handleDeleteConversation(conversationId: string) {
    if (conversationId.startsWith("local-")) {
      removeConversationLocal(conversationId);
      setActiveConversationId((current) => (current === conversationId ? null : current));
      return;
    }

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
      const message = error instanceof Error ? error.message : "Khong the xoa hoi thoai";
      toast.error(message);
    }
  }

  function ensureActiveConversation(prompt: string): AgentConversation {
    if (activeConversation) return activeConversation;
    const title = prompt.trim().slice(0, 40) || "Hoi thoai moi";
    const nextConversation = createConversation(title);
    upsertConversation(nextConversation);
    setActiveConversationId(nextConversation.id);
    return nextConversation;
  }

  function finalizeAssistantMessage(conversationId: string, messageId: string, patch?: Partial<AgentChatMessage>) {
    updateMessage(conversationId, messageId, (message) => ({
      ...message,
      ...patch,
      isStreaming: false,
    }));
  }

  function upsertToolCallInAssistant(conversationId: string, messageId: string, toolCall: AgentToolCall) {
    updateMessage(conversationId, messageId, (message) => {
      const current = message.toolCalls ?? [];
      const index = current.findIndex((item) => item.id === toolCall.id);
      if (index < 0) {
        return { ...message, toolCalls: [...current, toolCall] };
      }
      const next = [...current];
      next[index] = toolCall;
      return { ...message, toolCalls: next };
    });
  }

  function appendUICard(conversationId: string, messageId: string, card: AgentUICard) {
    updateMessage(conversationId, messageId, (message) => ({
      ...message,
      uiCards: [...(message.uiCards ?? []), card],
    }));
  }

  async function handleHitlDecision(card: AgentUICard, decision: "approved" | "rejected") {
    const payload = (card.payload ?? {}) as Record<string, unknown>;
    const threadIdFromPayload = typeof payload.threadId === "string" ? payload.threadId : undefined;
    const threadId = threadIdFromPayload || activeConversationId;

    if (!threadId || threadId.startsWith("local-")) {
      toast.error("Khong tim thay threadId de resume HITL.");
      return;
    }

    try {
      await resumeAgentRun(threadId, decision);
      toast.success(`Da gui quyet dinh ${decision}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Khong the gui quyet dinh HITL";
      toast.error(message);
    }
  }

  async function handleSubmitOrCancel() {
    if (isStreaming) {
      abortRef.current?.abort();
      const runId = runTrackingRef.current.runId;
      if (runId) {
        void cancelAgentRun(runId).catch(() => undefined);
      }
      return;
    }

    const prompt = draft.trim();
    if (!prompt) return;

    const conversation = ensureActiveConversation(prompt);
    let streamConversationId = conversation.id;
    setMobileHistoryOpen(false);

    const userMessage: AgentChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: prompt,
      createdAt: nowIso(),
    };

    const assistantMessage: AgentChatMessage = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: "",
      createdAt: nowIso(),
      isStreaming: true,
      toolCalls: [],
      uiCards: [],
    };

    const title = conversation.messages.length === 0 ? prompt.slice(0, 40) : conversation.title;

    upsertConversation({
      ...conversation,
      title,
      updatedAt: nowIso(),
      messages: [...conversation.messages, userMessage, assistantMessage],
    });

    setDraft("");
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;
    runTrackingRef.current = {};

    try {
      await startAgentRunStream(
        {
          message: prompt,
          threadId: conversation.id.startsWith("local-") ? undefined : conversation.id,
        },
        {
          onEvent: (event) => {
            if (event.runId) {
              runTrackingRef.current.runId = event.runId;
            }

            if (event.threadId) {
              runTrackingRef.current.threadId = event.threadId;
              if (streamConversationId !== event.threadId) {
                migrateConversationId(streamConversationId, event.threadId);
                streamConversationId = event.threadId;
              }
            }

            if (event.name === "message.chunk") {
              const delta = typeof event.data.content === "string" ? event.data.content : "";
              if (!delta) return;

              updateMessage(streamConversationId, assistantMessage.id, (message) => ({
                ...message,
                content: `${message.content}${delta}`,
              }));
              return;
            }

            if (event.name === "tool.started" || event.name === "tool.completed" || event.name === "tool.error") {
              const toolCall: AgentToolCall = {
                id: (event.data.callId as string) || (event.data.id as string) || `tool-${Date.now()}`,
                name: (event.data.toolName as string) || (event.data.name as string) || "unknown_tool",
                args: (event.data.args as Record<string, unknown>) || {},
                state: event.name === "tool.started" ? "pending" : event.name === "tool.completed" ? "completed" : "error",
                startedAt: event.timestamp,
                finishedAt: event.name === "tool.started" ? undefined : event.timestamp,
                errorMessage: typeof event.data.errorMessage === "string" ? event.data.errorMessage : undefined,
              };

              upsertToolCallInAssistant(streamConversationId, assistantMessage.id, toolCall);
              return;
            }

            if (event.name === "hitl.interrupt") {
              const card: AgentUICard = {
                id: `hitl-${Date.now()}`,
                type: "hitl",
                title: "Human Approval Required",
                description: "Agent dang cho phe duyet thao tac HITL.",
                payload: event.data,
              };

              appendUICard(streamConversationId, assistantMessage.id, card);
              return;
            }

            if (event.name === "run.error") {
              const errorText = typeof event.data.message === "string"
                ? event.data.message
                : "Co loi xay ra trong qua trinh xu ly.";

              updateMessage(streamConversationId, assistantMessage.id, (message) => ({
                ...message,
                content: message.content.trim()
                  ? `${message.content}\n\n_${errorText}_`
                  : errorText,
              }));
            }
          },
        },
        controller.signal,
      );
      finalizeAssistantMessage(streamConversationId, assistantMessage.id);
      void loadConversationSummaries();
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        updateMessage(streamConversationId, assistantMessage.id, (message) => ({
          ...message,
          isStreaming: false,
          content: message.content.trim()
            ? `${message.content}\n\n_Stream cancelled by user._`
            : "_Stream cancelled by user._",
        }));
      } else {
        updateMessage(streamConversationId, assistantMessage.id, (message) => ({
          ...message,
          isStreaming: false,
          content: message.content.trim()
            ? `${message.content}\n\n_Co loi xay ra khi stream response._`
            : "Co loi xay ra khi stream response. Vui long thu lai.",
        }));
      }
    } finally {
      abortRef.current = null;
      runTrackingRef.current = {};
      setIsStreaming(false);
    }
  }

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

  const content = (
    <Layout fixed>
      <Layout.Body className="h-full px-0 py-0 md:px-0">
        <div className="flex h-full min-h-0 flex-col md:flex-row">
          <div className={cn("h-60 md:h-full", mobileHistoryOpen ? "block" : "hidden md:block")}>
            <AgentConversationList
              conversations={sortedSummaries}
              activeConversationId={activeConversationId}
              onCreateConversation={createNewConversation}
              onSelectConversation={(conversationId) => {
                setActiveConversationId(conversationId);
                setMobileHistoryOpen(false);
                void loadConversationDetail(conversationId);
              }}
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
                AG-UI ready
              </div>
            </div>

            <ScrollArea className="min-h-0 flex-1">
              <div className="mx-auto w-full max-w-5xl space-y-4 px-4 py-4">
                {isLoadingHistory && (
                  <p className="text-xs text-muted-foreground">Dang tai conversation history...</p>
                )}
                {!activeConversation || activeConversation.messages.length === 0
                  ? renderEmptyState()
                  : activeConversation.messages.map((message) => (
                    <article
                      key={message.id}
                      className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
                    >
                      <div
                        className={cn(
                          "max-w-[86%] rounded-xl border px-3 py-2 md:max-w-[74%]",
                          message.role === "user"
                            ? "border-primary/30 bg-primary text-primary-foreground"
                            : "border-border bg-card",
                        )}
                      >
                        {message.role === "assistant" ? (
                          <AgentMarkdown content={message.content || "Dang streaming..."} />
                        ) : (
                          <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                        )}

                        {message.role === "assistant" && message.toolCalls && message.toolCalls.length > 0 && (
                          <div className="mt-3 space-y-2 border-t border-border/70 pt-2">
                            <div className="text-xs font-medium text-muted-foreground">Tools used</div>
                            {message.toolCalls.map((toolCall) => (
                              <AgentToolCallCard key={toolCall.id} toolCall={toolCall} />
                            ))}
                          </div>
                        )}

                        {message.role === "assistant" && message.uiCards && message.uiCards.length > 0 && (
                          <div className="mt-3 space-y-2 border-t border-border/70 pt-2">
                            <div className="text-xs font-medium text-muted-foreground">Generated components</div>
                            {message.uiCards.map((card) => (
                              <AgentUICardView key={card.id} card={card} onHitlDecision={handleHitlDecision} />
                            ))}
                          </div>
                        )}
                      </div>
                    </article>
                  ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <AgentComposer
              value={draft}
              isStreaming={isStreaming}
              onChange={setDraft}
              onSubmitOrCancel={handleSubmitOrCancel}
            />
          </section>
        </div>
      </Layout.Body>
    </Layout>
  );

  if (!copilotKitEnabled) {
    return content;
  }

  return (
    <CopilotKitProvider runtimeUrl={runtimeUrl}>
      {content}
    </CopilotKitProvider>
  );
}
