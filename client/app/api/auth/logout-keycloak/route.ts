import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

function identityApiBase() {
  const base = process.env.NEXT_PUBLIC_BACKEND_BASE_URL?.replace(/\/$/, '') ?? '';
  return base ? `${base}/api/v1` : '';
}

/**
 * Gọi identity-service qua API Gateway (Keycloak revoke refresh_token),
 * rồi client gọi signOut() để xóa cookie session NextAuth.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: 'AUTH_SECRET missing' }, { status: 500 });
  }

  const token = await getToken({ req, secret });
  const refreshToken = typeof token?.refresh_token === 'string' ? token.refresh_token : undefined;
  const base = identityApiBase();

  if (refreshToken && base) {
    try {
      await fetch(`${base}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // Vẫn trả ok để client xóa session cục bộ
    }
  }

  return NextResponse.json({ ok: true });
}
