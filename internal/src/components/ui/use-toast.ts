import { toast as sonnerToast } from 'sonner';

type ToastVariant = 'default' | 'destructive' | 'success';

type ToastInput =
    | string
    | {
          title?: React.ReactNode;
          description?: React.ReactNode;
          variant?: ToastVariant;
          duration?: number;
          action?: {
              label: string;
              onClick: () => void;
          };
      };

/**
 * Drop-in replacement for the shadcn/ui `toast` API on top of `sonner`.
 * Supports the `{ title, description, variant }` object shape used by the
 * template, as well as a plain-string shorthand.
 */
export function toast(input: ToastInput) {
    if (typeof input === 'string') {
        return sonnerToast(input);
    }

    const message = (input.title as string) ?? '';
    const opts: Parameters<typeof sonnerToast>[1] = {
        description: input.description as string,
        duration: input.duration,
        action: input.action
            ? { label: input.action.label, onClick: input.action.onClick }
            : undefined,
    };

    if (input.variant === 'destructive') return sonnerToast.error(message, opts);
    if (input.variant === 'success') return sonnerToast.success(message, opts);
    return sonnerToast(message, opts);
}

export const useToast = () => ({ toast, dismiss: sonnerToast.dismiss });
