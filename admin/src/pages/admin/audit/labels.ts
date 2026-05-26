/**
 * Friendly Vietnamese labels for audit codes.
 *
 * The dictionaries here are the SOURCE OF TRUTH for human-readable names.
 * Whenever a new service / action is introduced and emits its first audit
 * event, the filter automatically picks it up via /audit/facets. If no
 * mapping is provided here, we fall back to a generic Title-Case humanizer
 * so the UI never shows raw machine codes to operators.
 */

const SERVICE_LABELS: Record<string, string> = {
  'identity-service': 'Tài khoản & Đăng nhập',
  'user-service': 'Quản lý người dùng',
  'product-service': 'Sản phẩm',
  'order-service': 'Đơn hàng',
  'inventory-service': 'Kho hàng',
  'payment-service': 'Thanh toán',
  'shipping-service': 'Vận chuyển',
  'notification-service': 'Thông báo',
  'news-service': 'Tin tức',
  'chat-service': 'Tin nhắn',
  'storage-service': 'Tệp tin',
  'recommendation-service': 'Gợi ý sản phẩm',
  'agent-service': 'Trợ lý AI',
  'audit-service': 'Nhật ký kiểm toán',
};

const ENTITY_LABELS: Record<string, string> = {
  User: 'Người dùng',
  Role: 'Vai trò',
  Permission: 'Quyền',
  Product: 'Sản phẩm',
  Category: 'Danh mục',
  Brand: 'Thương hiệu',
  Order: 'Đơn hàng',
  Payment: 'Thanh toán',
  Inventory: 'Tồn kho',
  News: 'Tin tức',
  Shipping: 'Vận đơn',
  Notification: 'Thông báo',
  File: 'Tệp tin',
};

const ACTION_LABELS: Record<string, string> = {
  USER_REGISTERED: 'Đăng ký tài khoản',
  USER_LOGIN: 'Đăng nhập',
  USER_LOGIN_SOCIAL: 'Đăng nhập (mạng xã hội)',
  USER_LOGOUT: 'Đăng xuất',
  USER_FORGOT_PASSWORD: 'Quên mật khẩu',
  USER_PASSWORD_CHANGED: 'Đổi mật khẩu',
  USER_CREATED: 'Tạo người dùng',
  USER_UPDATED: 'Cập nhật người dùng',
  USER_DELETED: 'Xoá người dùng',
  USER_DISABLED: 'Khoá tài khoản',
  USER_ENABLED: 'Mở khoá tài khoản',
  ROLE_ASSIGNED: 'Gán vai trò',
  ROLE_REVOKED: 'Thu hồi vai trò',
};

const ACTION_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'> = {
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
  ROLE_ASSIGNED: 'secondary',
  ROLE_REVOKED: 'destructive',
};

const titleCase = (value: string): string =>
  value
    .replace(/[_-]/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const ACTION_VERBS: Array<{ pattern: RegExp; verb: string }> = [
  { pattern: /CREATED?$|_CREATE$/, verb: 'Tạo' },
  { pattern: /UPDATED?$|_UPDATE$/, verb: 'Cập nhật' },
  { pattern: /DELETED?$|_DELETE$|_REMOVE$/, verb: 'Xoá' },
  { pattern: /DISABLED?$|_DISABLE$/, verb: 'Vô hiệu' },
  { pattern: /ENABLED?$|_ENABLE$/, verb: 'Kích hoạt' },
  { pattern: /APPROVED?$/, verb: 'Phê duyệt' },
  { pattern: /REJECTED?$/, verb: 'Từ chối' },
  { pattern: /CANCEL(L)?ED?$/, verb: 'Huỷ' },
  { pattern: /SENT$/, verb: 'Gửi' },
  { pattern: /LOGIN$/, verb: 'Đăng nhập' },
  { pattern: /LOGOUT$/, verb: 'Đăng xuất' },
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
      const subjectLabel = subject ? labelEntityType(titleCase(subject).replace(/\s+/g, '')) : '';
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
