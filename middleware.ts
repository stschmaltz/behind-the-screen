import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const OLD_DOMAIN = 'dungeon-master-essentials.com';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host');
  if (
    host?.includes(OLD_DOMAIN) &&
    request.nextUrl.pathname !== '/domain-moved'
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/domain-moved';
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|domain-moved).*)'],
};
