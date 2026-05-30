import dayjs from "dayjs";
import { IconDotsVertical, IconMessageCirclePlus, IconChevronsLeft, IconChevronsRight } from "@tabler/icons-react";
import { Button } from "@/components/custom/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { AgentConversationSummary } from "@/features/agent/types";
import { cn } from "@/lib/utils";

interface AgentConversationListProps {
  conversations: AgentConversationSummary[];
  activeConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onCreateConversation: () => void;
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
  onRenameConversation: (conversationId: string) => void;
  onDeleteConversation: (conversationId: string) => void;
}

export function AgentConversationList({
  conversations,
  activeConversationId,
  onSelectConversation,
  onCreateConversation,
  isCollapsed,
  onToggleCollapsed,
  onRenameConversation,
  onDeleteConversation,
}: AgentConversationListProps) {
  return (
    <aside className={cn("flex h-full flex-col border-r bg-card/30 transition-[width]", isCollapsed ? "w-16 min-w-16" : "w-full md:w-80 md:min-w-80")}>
      <div className={cn("flex items-center gap-2 border-b px-3 py-3", isCollapsed ? "justify-center" : "justify-between")}>
        {!isCollapsed && <h2 className="text-sm font-semibold">Conversation History</h2>}
        <div className="flex items-center gap-1">
          {!isCollapsed && (
            <Button type="button" size="sm" variant="outline" onClick={onCreateConversation}>
              <IconMessageCirclePlus size={14} className="mr-1" />
              New
            </Button>
          )}
          <Button type="button" size="icon" variant="ghost" onClick={onToggleCollapsed} aria-label="Toggle conversation sidebar">
            {isCollapsed ? <IconChevronsRight size={16} /> : <IconChevronsLeft size={16} />}
          </Button>
        </div>
      </div>

      <ScrollArea className={cn("h-[calc(100%-56px)]", isCollapsed && "hidden")}>
        <div className="space-y-1 p-2">
          {conversations.length === 0 && (
            <div className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
              Chua co hoi thoai. Bam New de mo cua so trong.
            </div>
          )}

          {conversations.map((conversation) => {
            const isActive = conversation.id === activeConversationId;
            return (
              <div
                key={conversation.id}
                className={cn(
                  "rounded-md border px-3 py-2 transition-colors",
                  isActive
                    ? "border-primary/40 bg-primary/10"
                    : "border-transparent hover:border-border hover:bg-muted/60",
                )}
              >
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  <div className="truncate text-sm font-medium">{conversation.title}</div>
                  <div className="line-clamp-2 text-xs text-muted-foreground">{conversation.preview || "No messages yet"}</div>
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    {dayjs(conversation.updatedAt).format("DD/MM/YYYY HH:mm")}
                  </div>
                </button>

                <div className="mt-2 flex items-center justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        aria-label={`Conversation options for ${conversation.title}`}
                        onClick={(event) => event.stopPropagation()}
                      >
                        <IconDotsVertical size={14} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem
                        onSelect={(event) => {
                          event.preventDefault();
                          onRenameConversation(conversation.id);
                        }}
                      >
                        Chinh sua ten
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onSelect={(event) => {
                          event.preventDefault();
                          onDeleteConversation(conversation.id);
                        }}
                      >
                        Xoa hoi thoai
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {isCollapsed && (
        <div className="flex flex-1 items-center justify-center px-2 text-[11px] text-muted-foreground [writing-mode:vertical-rl]">
          <span>History</span>
        </div>
      )}
    </aside>
  );
}
