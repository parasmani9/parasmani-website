import { NextResponse } from 'next/server';

import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  getAdminCredentials,
  getAdminSessionTtl,
} from '@/lib/admin-auth';

interface LoginBody {
  email?: string;
  password?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginBody;
    const email = body.email?.trim().toLowerCase();
    const password = body.password?.trim() ?? '';
    const adminCredentials = getAdminCredentials();

    if (email !== adminCredentials.email || password !== adminCredentials.password) {
      return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 });
    }

    const token = createAdminSessionToken(email);
    const response = NextResponse.json({ ok: true });

    const isSecure = request.url.startsWith('https://') || process.env.NODE_ENV === 'production';

    response.cookies.set(ADMIN_SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isSecure,
      path: '/',
      maxAge: getAdminSessionTtl(),
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected server error' },
      { status: 500 }
    );
  }
}
