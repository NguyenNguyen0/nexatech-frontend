import { IconSend, IconSquare } from "@tabler/icons-react";
import { Button } from "@/components/custom/button";
import { Textarea } from "@/components/ui/textarea";

interface AgentComposerProps {
  value: string;
  onChange: (next: string) => void;
  isStreaming: boolean;
  onSubmitOrCancel: () => void;
}

export function AgentComposer({ value, onChange, isStreaming, onSubmitOrCancel }: AgentComposerProps) {
  const disabledSubmit = !value.trim() && !isStreaming;

  return (
    <div className="border-t bg-background px-4 py-3">
      <div className="flex items-end gap-2">
        <Textarea
          value={value}
          placeholder="Nhap prompt cho NexaTech Agent..."
          className="min-h-14 resize-none"
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              onSubmitOrCancel();
            }
          }}
        />
        <Button
          size="icon"
          type="button"
          variant={isStreaming ? "destructive" : "default"}
          disabled={disabledSubmit}
          onClick={onSubmitOrCancel}
          aria-label={isStreaming ? "Cancel agent response" : "Send prompt"}
        >
          {isStreaming ? <IconSquare size={16} /> : <IconSend size={16} />}
        </Button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Enter de gui, Shift+Enter de xuong dong.</p>
    </div>
  );
}
