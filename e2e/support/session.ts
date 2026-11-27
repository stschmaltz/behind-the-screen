import { generateSessionCookie } from '@auth0/nextjs-auth0/testing';
import { requireEnv } from './env';

export interface TestUser {
  sub: string;
  email: string;
  name: string;
}

export const PRIMARY_USER: TestUser = {
  sub: 'e2e|dm-essentials-primary',
  email: 'e2e-primary@example.test',
  name: 'E2E Primary',
};

export const OTHER_USER: TestUser = {
  sub: 'e2e|dm-essentials-other',
  email: 'e2e-other@example.test',
  name: 'E2E Other',
};

export const SESSION_COOKIE_NAME = 'appSession';

/**
 * Builds a signed Auth0 session cookie for a test user with the app's own
 * AUTH0_SECRET, so tests never go through the hosted Auth0 login page.
 */
export const createSessionCookie = (user: TestUser): Promise<string> =>
  generateSessionCookie(
    { user: { ...user, email_verified: true } },
    { secret: requireEnv('AUTH0_SECRET') },
  );
