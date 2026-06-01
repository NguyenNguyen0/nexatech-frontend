import { useEffect, useMemo, useRef, useState } from "react";
import { IconAlertTriangle, IconRefresh, IconSparkles } from "@tabler/icons-react";
import { CopilotKitProvider } from "@copilotkit/react-core/v2";
import { Layout } from "@/components/custom/layout";
import { Button } from "@/components/custom/button";
import useLocalStorage from "@/hooks/use-local-storage";
import { useAgentChat } from "@/features/agent/hooks/use-agent-chat";
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
  AgentHitlDecisionInput,
  AgentToolCall,
  AgentUICard,
} from "@/features/agent/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { getAccessToken } from "@/services/authSession";
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

function getAgentStreamErrorMessage(error: unknown): string {
  if (error instanceof TypeError) {
    return "Khong ket noi duoc den agent service. Kiem tra mang hoac backend roi thu lai.";
  }

  if (error instanceof Error) {
    const detail = error.message.trim();
    if (!detail) return "Agent service khong phan hoi. Vui long thu lai.";
    if (/failed to fetch|networkerror|network request failed/i.test(detail)) {
      return "Mat ket noi khi dang nhan phan hoi tu agent. Vui long kiem tra mang va thu lai.";
    }
    return detail;
  }

  return "Agent service khong phan hoi. Vui long thu lai.";
}


/** Simple pulsing dots shown while the agent is generating text with no tool activity. */
function StreamingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-0.5" aria-label="Agent dang xu ly">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
    </span>
  );
}

type AguiChatBridge = {
  derivedMessages: AgentChatMessage[];
  sendMessage: (content: string) => Promise<void>;
  stopGeneration: () => void;
  isLoading: boolean;
  isReady: boolean;
};


function AgentPageContent({
  copilotKitEnabled,
  aguiChat,
}: {
  copilotKitEnabled: boolean;
  aguiChat: AguiChatBridge | null;
}) {
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
  const aguiRunRef = useRef<{
    conversationId: string;
    assistantMessageId: string;
    prompt: string;
    lastContent: string;
    /** Stable key for change detection: "id:state|id:state" across ALL tool calls */
    lastToolCallKey: string;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const runTrackingRef = useRef<{ runId?: string; threadId?: string }>({});
  const loadedConversationDetailRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    void loadConversationSummaries();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [conversations, activeConversationId]);

  // Sync AG-UI derived messages (text + tool calls) into the local conversation.
  // The AG-UI protocol may place tool calls and the final text response in
  // separate AssistantMessages, so we collect ALL tool calls from ALL assistant
  // messages rather than only reading the last one.
  useEffect(() => {
    if (!copilotKitEnabled || !aguiChat || !aguiChat.isReady) return;
    const pending = aguiRunRef.current;
    if (!pending) return;

    const derived = aguiChat.derivedMessages;

    // Latest text = content of the last assistant message
    const lastAssistant = [...derived].reverse().find((m) => m.role === "assistant");
    const latestText = lastAssistant?.content ?? "";

    // All tool calls = union across every assistant message in the derived list
    const allToolCalls = derived
      .filter((m): m is AgentChatMessage & { role: "assistant" } => m.role === "assistant")
      .flatMap((m) => m.toolCalls ?? []);

    // Stable key for change detection — avoids "always-truthy length > 0" issue
    const toolCallKey = allToolCalls.map((tc) => `${tc.id}:${tc.state}`).join("|");
    const hasChange = latestText !== pending.lastContent || toolCallKey !== pending.lastToolCallKey;
    if (!hasChange) return;

    pending.lastContent = latestText;
    pending.lastToolCallKey = toolCallKey;

    updateMessage(pending.conversationId, pending.assistantMessageId, (message) => ({
      ...message,
      content: latestText,
      toolCalls: allToolCalls.length > 0 ? allToolCalls : message.toolCalls,
      isStreaming: aguiChat.isLoading,
    }));
  }, [copilotKitEnabled, aguiChat]);

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
          (conversation) =>
            !summaryIds.has(conversation.id)
            && (conversation.id.startsWith("local-")
              || conversation.messages.length > 0
              || conversation.id === activeConversationId),
        );
        return [...serverConversations, ...optimisticConversations].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
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
    loadedConversationDetailRef.current.add(toId);
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

  async function handleHitlDecision(card: AgentUICard, decisionInput: AgentHitlDecisionInput) {
    const payloadRecord = (card.payload ?? {}) as Record<string, unknown>;
    const interruptRecord = (payloadRecord.interrupt ?? {}) as Record<string, unknown>;
    const interruptValue = (interruptRecord.value ?? {}) as Record<string, unknown>;
    const payload = (card.payload ?? {}) as Record<string, unknown>;
    const threadIdFromPayload = typeof payload.threadId === "string" ? payload.threadId : undefined;
    const nestedThreadId = typeof interruptValue.threadId === "string" ? interruptValue.threadId : undefined;
    const threadId = threadIdFromPayload || nestedThreadId || activeConversationId;

    if (!threadId || threadId.startsWith("local-")) {
      toast.error("Khong tim thay threadId de resume HITL.");
      return;
    }

    const decision = decisionInput.decision === "edited"
      ? {
          decision: "edited",
          args: decisionInput.modifiedArgs ?? {},
          reason: decisionInput.reason,
        }
      : decisionInput.decision;

    try {
      await resumeAgentRun(threadId, decision);
      toast.success(`Da gui quyet dinh ${decisionInput.decision}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Khong the gui quyet dinh HITL";
      toast.error(message);
    }
  }

  async function streamAgentResponseAgui(prompt: string, conversationId: string, assistantMessageId: string) {
    if (!aguiChat || !aguiChat.isReady) {
      await streamAgentResponse(prompt, conversationId, assistantMessageId);
      return;
    }

    setIsStreaming(true);
    // The sync effect (above) handles real-time updates reactively;
    // no stale-closure final sync needed here.
    aguiRunRef.current = {
      conversationId,
      assistantMessageId,
      prompt,
      lastContent: "",
      lastToolCallKey: "",
    };

    try {
      await aguiChat.sendMessage(prompt);
      finalizeAssistantMessage(conversationId, assistantMessageId);
      void loadConversationSummaries();
    } catch (error) {
      const errorMessage = getAgentStreamErrorMessage(error);
      updateMessage(conversationId, assistantMessageId, (message) => ({
        ...message,
        isStreaming: false,
        errorMessage,
        retryPrompt: prompt,
      }));
      toast.error(errorMessage);
    } finally {
      aguiRunRef.current = null;
      setIsStreaming(false);
    }
  }

  async function streamAgentResponse(prompt: string, conversationId: string, assistantMessageId: string) {
    let streamConversationId = conversationId;
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;
    runTrackingRef.current = {};

    try {
      await startAgentRunStream(
        {
          message: prompt,
          threadId: conversationId.startsWith("local-") ? undefined : conversationId,
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

              updateMessage(streamConversationId, assistantMessageId, (message) => ({
                ...message,
                content: `${message.content}${delta}`,
              }));
              return;
            }

            if (event.name === "tool.started" || event.name === "tool.completed" || event.name === "tool.error") {
              const toolCall: AgentToolCall = {
                id: (event.data.callId as string) || (event.data.id as string) || `tool-${Date.now()}`,
                name:
                  (event.data.toolName as string)
                  || (event.data.name as string)
                  || (event.data.tool as string)
                  || "unknown_tool",
                args: (event.data.args as Record<string, unknown>) || {},
                state: event.name === "tool.started" ? "pending" : event.name === "tool.completed" ? "completed" : "error",
                startedAt: event.timestamp,
                finishedAt: event.name === "tool.started" ? undefined : event.timestamp,
                errorMessage:
                  typeof event.data.errorMessage === "string"
                    ? event.data.errorMessage
                    : typeof event.data.message === "string"
                      ? event.data.message
                      : undefined,
                statusCode: typeof event.data.statusCode === "number" ? event.data.statusCode : undefined,
                result: event.data.result ?? event.data.output ?? event.data.data,
                error: event.data.error,
                completedAt: event.name === "tool.started" ? undefined : event.timestamp,
              };

              upsertToolCallInAssistant(streamConversationId, assistantMessageId, toolCall);
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

              appendUICard(streamConversationId, assistantMessageId, card);
              return;
            }

            if (event.name === "run.error") {
              const errorText = typeof event.data.message === "string"
                ? event.data.message
                : "Co loi xay ra trong qua trinh xu ly.";

              updateMessage(streamConversationId, assistantMessageId, (message) => ({
                ...message,
                errorMessage: errorText,
                retryPrompt: prompt,
              }));
            }
          },
        },
        controller.signal,
      );
      finalizeAssistantMessage(streamConversationId, assistantMessageId);
      void loadConversationSummaries();
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        updateMessage(streamConversationId, assistantMessageId, (message) => ({
          ...message,
          isStreaming: false,
          content: message.content.trim()
            ? `${message.content}\n\n_Stream cancelled by user._`
            : "_Stream cancelled by user._",
        }));
      } else {
        const errorMessage = getAgentStreamErrorMessage(error);
        updateMessage(streamConversationId, assistantMessageId, (message) => ({
          ...message,
          isStreaming: false,
          errorMessage,
          retryPrompt: prompt,
        }));
        toast.error(errorMessage);
      }
    } finally {
      abortRef.current = null;
      runTrackingRef.current = {};
      setIsStreaming(false);
    }
  }

  async function sendAgentMessage(prompt: string, options: { clearDraft?: boolean } = {}) {
    if (!prompt) return;

    const conversation = ensureActiveConversation(prompt);
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
      retryPrompt: prompt,
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

    if (options.clearDraft !== false) {
      setDraft("");
    }

    if (copilotKitEnabled && aguiChat?.isReady) {
      await streamAgentResponseAgui(prompt, conversation.id, assistantMessage.id);
      return;
    }

    await streamAgentResponse(prompt, conversation.id, assistantMessage.id);
  }

  async function handleSubmitOrCancel() {
    if (isStreaming) {
      if (copilotKitEnabled && aguiChat?.isReady) {
        aguiChat.stopGeneration();
        const pending = aguiRunRef.current;
        if (pending) {
          updateMessage(pending.conversationId, pending.assistantMessageId, (message) => ({
            ...message,
            isStreaming: false,
            content: message.content.trim()
              ? `${message.content}\n\n_Stream cancelled by user._`
              : "_Stream cancelled by user._",
          }));
          aguiRunRef.current = null;
        }
        setIsStreaming(false);
        return;
      }

      abortRef.current?.abort();
      const runId = runTrackingRef.current.runId;
      if (runId) {
        void cancelAgentRun(runId).catch(() => undefined);
      }
      return;
    }

    const prompt = draft.trim();
    await sendAgentMessage(prompt);
  }

  async function handleRetryMessage(message: AgentChatMessage) {
    if (isStreaming || !message.retryPrompt?.trim()) return;

    const conversation = conversations.find((item) =>
      item.messages.some((conversationMessage) => conversationMessage.id === message.id),
    );
    if (!conversation) {
      toast.error("Khong tim thay hoi thoai de retry message nay.");
      return;
    }

    setMobileHistoryOpen(false);
    setActiveConversationId(conversation.id);
    updateMessage(conversation.id, message.id, (currentMessage) => ({
      ...currentMessage,
      content: "",
      errorMessage: undefined,
      isStreaming: true,
      retryPrompt: message.retryPrompt,
      toolCalls: [],
      uiCards: [],
    }));

    await streamAgentResponse(message.retryPrompt.trim(), conversation.id, message.id);
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
                {copilotKitEnabled ? "AG-UI mode" : "SSE fallback"}
              </div>
            </div>

            <ScrollArea className="min-h-0 flex-1">
              <div className="mx-auto w-full max-w-5xl space-y-4 px-4 py-4">
                {isLoadingHistory && (
                  <p className="text-xs text-muted-foreground">Dang tai conversation history...</p>
                )}
                {!activeConversation || activeConversation.messages.length === 0
                  ? renderEmptyState()
                  : activeConversation.messages.map((message) => {
                    const hasToolCalls = (message.toolCalls?.length ?? 0) > 0;
                    const hasContent = message.role === "assistant" && message.content.trim().length > 0;
                    const hasPendingTool = message.toolCalls?.some((tc) => tc.state === "pending") ?? false;
                    // Show the bubble: always for user, and for assistant when there's
                    // text, an error, or the agent is streaming with no active tool call.
                    const showBubble =
                      message.role === "user" ||
                      hasContent ||
                      Boolean(message.errorMessage) ||
                      (message.isStreaming && !hasPendingTool);

                    return (
                      <article
                        key={message.id}
                        className={cn(
                          "flex flex-col gap-1.5",
                          message.role === "user" ? "items-end" : "items-start",
                        )}
                      >
                        {/* ── Tool call cards — rendered ABOVE the message bubble ── */}
                        {message.role === "assistant" && hasToolCalls && (
                          <div className="w-full max-w-[86%] space-y-1.5 md:max-w-[74%]">
                            {message.toolCalls!.map((toolCall) => (
                              <AgentToolCallCard key={toolCall.id} toolCall={toolCall} />
                            ))}
                          </div>
                        )}

                        {/* ── Message bubble ── */}
                        {showBubble && (
                          <div
                            className={cn(
                              "max-w-[86%] rounded-xl border px-3 py-2 md:max-w-[74%]",
                              message.role === "user"
                                ? "border-primary/30 bg-primary text-primary-foreground"
                                : "border-border bg-card",
                            )}
                          >
                            {/* User content */}
                            {message.role === "user" && (
                              <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                            )}

                            {/* Assistant: streaming dots (no content yet, no pending tool) */}
                            {message.role === "assistant" && !hasContent && message.isStreaming && !hasPendingTool && (
                              <StreamingDots />
                            )}

                            {/* Assistant: text content */}
                            {hasContent && <AgentMarkdown content={message.content} />}

                            {/* Assistant: trailing dots while still streaming text */}
                            {hasContent && message.isStreaming && (
                              <span className="mt-1 block">
                                <StreamingDots />
                              </span>
                            )}

                            {/* Assistant: error */}
                            {message.role === "assistant" && message.errorMessage && (
                              <div className={cn(hasContent && "mt-3 border-t border-border/70 pt-2", "rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive")}>
                                <div className="flex items-start gap-2">
                                  <IconAlertTriangle size={16} className="mt-0.5 shrink-0" />
                                  <div className="min-w-0 flex-1">
                                    <p className="font-medium">Khong the nhan phan hoi tu agent</p>
                                    <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed">
                                      {message.errorMessage}
                                    </p>
                                  </div>
                                </div>
                                {message.retryPrompt && (
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="mt-3 border-destructive/40 bg-background text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    disabled={isStreaming}
                                    leftSection={<IconRefresh size={14} />}
                                    onClick={() => void handleRetryMessage(message)}
                                  >
                                    Thu lai message nay
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* ── UI Cards (HITL, charts, etc.) — below the bubble ── */}
                        {message.role === "assistant" && (message.uiCards?.length ?? 0) > 0 && (
                          <div className="w-full max-w-[86%] space-y-2 md:max-w-[74%]">
                            {message.uiCards!.map((card) => (
                              <AgentUICardView key={card.id} card={card} onHitlDecision={handleHitlDecision} />
                            ))}
                          </div>
                        )}
                      </article>
                    );
                  })}
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

  return content;
}

function AgentPageAguiContent({ copilotKitEnabled }: { copilotKitEnabled: boolean }) {
  const agui = useAgentChat();

  return (
    <AgentPageContent
      copilotKitEnabled={copilotKitEnabled}
      aguiChat={{
        derivedMessages: agui.derivedMessages,
        sendMessage: agui.sendMessage,
        stopGeneration: agui.stopGeneration,
        isLoading: agui.isLoading,
        isReady: agui.isReady,
      }}
    />
  );
}


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
