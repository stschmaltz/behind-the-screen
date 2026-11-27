import fs from 'fs';
import path from 'path';

const envFile = path.resolve(__dirname, '../../.env.local');
if (fs.existsSync(envFile)) {
  process.loadEnvFile(envFile);
}

export const E2E_PORT = Number(process.env.E2E_PORT || 3100);
export const BASE_URL =
  process.env.E2E_BASE_URL || `http://localhost:${E2E_PORT}`;
export const AUTH_DIR = path.resolve(__dirname, '../.auth');
export const STORAGE_STATE = path.join(AUTH_DIR, 'user.json');
export const SEED_FILE = path.join(AUTH_DIR, 'seed.json');

/**
 * The suite writes campaigns, players and encounters for dedicated test
 * users into whatever database the dev server is connected to. Refuse to run
 * unless that database is clearly not production.
 */
export const assertSafeDatabase = () => {
  const dbName = process.env.DB_NAME ?? '';
  if (process.env.E2E_ALLOW_ANY_DB === 'true') return;
  if (!/dev|test|e2e|local/i.test(dbName)) {
    throw new Error(
      `Refusing to run e2e tests against database "${dbName}". ` +
        'Point DB_NAME at a development/test database, or set E2E_ALLOW_ANY_DB=true.',
    );
  }
};

export const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} must be set (see .env.base)`);

  return value;
};
