const GUEST_CHAT_SESSION_KEY = 'chat_guest_session_id';

function createGuestSessionId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function getOrCreateGuestChatSessionId(): string | null {
  if (typeof window === 'undefined') return null;

  const existing = localStorage.getItem(GUEST_CHAT_SESSION_KEY);
  if (existing) return existing;

  const created = createGuestSessionId();
  localStorage.setItem(GUEST_CHAT_SESSION_KEY, created);
  return created;
}
