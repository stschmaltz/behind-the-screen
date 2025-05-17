export const FEATURED_EMAILS = ['stschmaltz@gmail.com'];

export function isFeatureEnabled(email?: string | null): boolean {
  if (!email) return false;

  return FEATURED_EMAILS.includes(email);
}
