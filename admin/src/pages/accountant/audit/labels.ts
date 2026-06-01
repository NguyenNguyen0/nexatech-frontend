/**
 * Friendly labels for audit codes.
 *
 * The dictionaries here are the SOURCE OF TRUTH for human-readable names.
 * Whenever a new service / action is introduced and emits its first audit
 * event, the filter automatically picks it up via /audit/facets. If no
 * mapping is provided here, we fall back to a generic Title-Case humanizer
 * so the UI never shows raw machine codes to operators.
 */

const SERVICE_LABELS: Record<string, string> = {
  'identity-service': 'Identity & Sign-in',
  'user-service': 'User Management',
  'product-service': 'Products',
  'order-service': 'Orders',
  'inventory-service': 'Inventory',
  'payment-service': 'Payments',
  'shipping-service': 'Shipping',
  'notification-service': 'Notifications',
  'news-service': 'News',
  'chat-service': 'Chat',
  'storage-service': 'Storage',
  'recommendation-service': 'Recommendations',
  'agent-service': 'AI Agent',
  'audit-service': 'Audit Log',
};

const ENTITY_LABELS: Record<string, string> = {
  User: 'User',
  Role: 'Role',
  Permission: 'Permission',
  Product: 'Product',
  Category: 'Category',
  Brand: 'Brand',
  Order: 'Order',
  Payment: 'Payment',
  Inventory: 'Inventory',
  News: 'News article',
  Shipping: 'Shipment',
  Notification: 'Notification',
  Email: 'Email',
  File: 'File',
};

const ACTION_LABELS: Record<string, string> = {
  USER_REGISTERED: 'Account registered',
  USER_LOGIN: 'Signed in',
  USER_LOGIN_SOCIAL: 'Signed in (social)',
  USER_LOGOUT: 'Signed out',
  USER_FORGOT_PASSWORD: 'Forgot password',
  USER_PASSWORD_CHANGED: 'Password changed',
  USER_CREATED: 'User created',
  USER_UPDATED: 'User updated',
  USER_DELETED: 'User deleted',
  USER_DISABLED: 'User disabled',
  USER_ENABLED: 'User enabled',
  USER_ROLE_CHANGED: 'Role changed',
  USER_ROLE_REVOKED: 'Role revoked',
  ROLE_ASSIGNED: 'Role assigned',
  ROLE_REVOKED: 'Role revoked',
  NEWS_CREATED: 'News article created',
  NEWS_UPDATED: 'News article updated',
  NEWS_PUBLISHED: 'News article published',
  NEWS_UNPUBLISHED: 'News article unpublished',
  NEWS_DELETED: 'News article deleted',
  NOTIFICATION_MARK_ALL_READ: 'Marked all notifications read',
  NOTIFICATION_RETRY_EXHAUSTED: 'Notification delivery abandoned',
  EMAIL_SEND_FAILED: 'Email delivery failed',
};

const ACTION_VARIANTS: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'
> = {
  USER_REGISTERED: 'success',
  USER_LOGIN: 'default',
  USER_LOGIN_SOCIAL: 'default',
  USER_LOGOUT: 'outline',
  USER_FORGOT_PASSWORD: 'warning',
  USER_PASSWORD_CHANGED: 'warning',
  USER_CREATED: 'success',
  USER_UPDATED: 'secondary',
  USER_DELETED: 'destructive',
  USER_DISABLED: 'destructive',
  USER_ENABLED: 'success',
  USER_ROLE_CHANGED: 'secondary',
  USER_ROLE_REVOKED: 'destructive',
  ROLE_ASSIGNED: 'secondary',
  ROLE_REVOKED: 'destructive',
  NEWS_CREATED: 'success',
  NEWS_UPDATED: 'secondary',
  NEWS_PUBLISHED: 'success',
  NEWS_UNPUBLISHED: 'warning',
  NEWS_DELETED: 'destructive',
  NOTIFICATION_MARK_ALL_READ: 'outline',
  NOTIFICATION_RETRY_EXHAUSTED: 'destructive',
  EMAIL_SEND_FAILED: 'destructive',
};

const titleCase = (value: string): string =>
  value
    .replace(/[_-]/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const ACTION_VERBS: Array<{ pattern: RegExp; verb: string }> = [
  { pattern: /CREATED?$|_CREATE$/, verb: 'Created' },
  { pattern: /UPDATED?$|_UPDATE$/, verb: 'Updated' },
  { pattern: /DELETED?$|_DELETE$|_REMOVE$/, verb: 'Deleted' },
  { pattern: /DISABLED?$|_DISABLE$/, verb: 'Disabled' },
  { pattern: /ENABLED?$|_ENABLE$/, verb: 'Enabled' },
  { pattern: /PUBLISHED?$/, verb: 'Published' },
  { pattern: /UNPUBLISHED?$/, verb: 'Unpublished' },
  { pattern: /APPROVED?$/, verb: 'Approved' },
  { pattern: /REJECTED?$/, verb: 'Rejected' },
  { pattern: /CANCEL(L)?ED?$/, verb: 'Cancelled' },
  { pattern: /REVOKED?$/, verb: 'Revoked' },
  { pattern: /CHANGED?$/, verb: 'Changed' },
  { pattern: /SENT$/, verb: 'Sent' },
  { pattern: /_FAILED$/, verb: 'Failed' },
  { pattern: /LOGIN$/, verb: 'Signed in' },
  { pattern: /LOGOUT$/, verb: 'Signed out' },
];

export const labelService = (code?: string | null): string => {
  if (!code) return '—';
  return SERVICE_LABELS[code] ?? titleCase(code.replace(/-service$/, ''));
};

export const labelEntityType = (code?: string | null): string => {
  if (!code) return '—';
  return ENTITY_LABELS[code] ?? titleCase(code);
};

export const labelAction = (code?: string | null): string => {
  if (!code) return '—';
  if (ACTION_LABELS[code]) return ACTION_LABELS[code];
  for (const { pattern, verb } of ACTION_VERBS) {
    if (pattern.test(code)) {
      const subject = code.replace(pattern, '').replace(/_$/, '');
      const subjectLabel = subject
        ? labelEntityType(titleCase(subject).replace(/\s+/g, ''))
        : '';
      return subjectLabel ? `${verb} ${subjectLabel.toLowerCase()}` : verb;
    }
  }
  return titleCase(code);
};

export const actionVariant = (
  code?: string | null
): 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' => {
  if (!code) return 'outline';
  if (ACTION_VARIANTS[code]) return ACTION_VARIANTS[code];
  if (/DELETE|REMOVE|DISABLE|REJECT|CANCEL/.test(code)) return 'destructive';
  if (/CREATE|REGISTER|ENABLE|APPROVE|SUCCESS/.test(code)) return 'success';
  if (/UPDATE|CHANGE|EDIT/.test(code)) return 'secondary';
  if (/LOGOUT/.test(code)) return 'outline';
  return 'default';
};
