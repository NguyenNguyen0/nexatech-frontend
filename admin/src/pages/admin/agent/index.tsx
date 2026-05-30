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
import { runMockAgentStream } from "@/features/agent/services/mockAgentRuntime";
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

const CONVERSATION_STORAGE_KEY = "nexatech_admin_agent_conversations_v1";
const DRAFT_STORAGE_KEY = "nexatech_admin_agent_draft_v1";

function nowIso(): string {
  return new Date().toISOString();
}

function createConversation(title = "Hoi thoai moi"): AgentConversation {
  const now = nowIso();
  return {
    id: `conv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
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
  const runtimeUrl = import.meta.env.VITE_COPILOTKIT_RUNTIME_URL || "/api/copilotkit";
  const [conversations, setConversations] = useLocalStorage<AgentConversation[]>({
    key: CONVERSATION_STORAGE_KEY,
    defaultValue: [],
  });
  const [draft, setDraft] = useLocalStorage<string>({
    key: DRAFT_STORAGE_KEY,
    defaultValue: "",
  });
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(true);
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const didInitializeSelectionRef = useRef(false);

  useEffect(() => {
    if (didInitializeSelectionRef.current) return;
    didInitializeSelectionRef.current = true;

    if (!activeConversationId && conversations.length > 0) {
      setActiveConversationId(conversations[0].id);
    }
  }, [activeConversationId, conversations]);

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

  function upsertConversation(conversation: AgentConversation) {
    setConversations((current) => {
      const index = current.findIndex((item) => item.id === conversation.id);
      if (index < 0) return [conversation, ...current];
      const next = [...current];
      next[index] = conversation;
      return next;
    });
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

  function handleRenameConversation(conversationId: string) {
    const conversation = conversations.find((item) => item.id === conversationId);
    toast.info(
      conversation
        ? `Rename for "${conversation.title}" will be added in the next step.`
        : "Rename will be added in the next step.",
    );
  }

  function handleDeleteConversation(conversationId: string) {
    const conversation = conversations.find((item) => item.id === conversationId);
    toast.info(
      conversation
        ? `Delete for "${conversation.title}" will be added in the next step.`
        : "Delete will be added in the next step.",
    );
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

  async function handleSubmitOrCancel() {
    if (isStreaming) {
      abortRef.current?.abort();
      return;
    }

    const prompt = draft.trim();
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

    try {
      await runMockAgentStream(
        prompt,
        {
          onTextDelta: (delta) => {
            updateMessage(conversation.id, assistantMessage.id, (message) => ({
              ...message,
              content: `${message.content}${delta}`,
            }));
          },
          onToolCallUpdate: (toolCall) => {
            upsertToolCallInAssistant(conversation.id, assistantMessage.id, toolCall);
          },
          onUICard: (card) => {
            appendUICard(conversation.id, assistantMessage.id, card);
          },
        },
        controller.signal,
      );
      finalizeAssistantMessage(conversation.id, assistantMessage.id);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        updateMessage(conversation.id, assistantMessage.id, (message) => ({
          ...message,
          isStreaming: false,
          content: message.content.trim()
            ? `${message.content}\n\n_Stream cancelled by user._`
            : "_Stream cancelled by user._",
        }));
      } else {
        updateMessage(conversation.id, assistantMessage.id, (message) => ({
          ...message,
          isStreaming: false,
          content: message.content.trim()
            ? `${message.content}\n\n_Co loi xay ra khi stream response._`
            : "Co loi xay ra khi stream response. Vui long thu lai.",
        }));
      }
    } finally {
      abortRef.current = null;
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

  return (
    <CopilotKitProvider runtimeUrl={runtimeUrl}>
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
                                <AgentUICardView key={card.id} card={card} />
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
    </CopilotKitProvider>
  );
}
