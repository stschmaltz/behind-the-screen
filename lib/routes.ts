const PUBLIC_PATHS = new Set([
  '/',
  '/npc-generator',
  '/loot-generator',
  '/demo',
  '/support',
  '/privacy',
  '/terms',
  '/login-required',
  '/domain-moved',
  '/404',
  '/_offline',
  '/_error',
]);

export const isPublicPath = (pathname: string): boolean =>
  PUBLIC_PATHS.has(pathname) || pathname.startsWith('/api/');
