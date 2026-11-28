import type { CaptureResult } from 'posthog-js';

const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);
const NAVIGATION_ABORT_MESSAGE = 'routeChange aborted';

export const isLocalHostname = (hostname: string): boolean =>
  LOCAL_HOSTNAMES.has(hostname) || hostname.endsWith('.localhost');

const isNavigationAbort = (event: CaptureResult): boolean => {
  if (event.event !== '$exception') return false;
  const exceptions: unknown = event.properties?.$exception_list;
  if (!Array.isArray(exceptions)) return false;

  return exceptions.some(
    (exception) =>
      typeof exception?.value === 'string' &&
      exception.value.includes(NAVIGATION_ABORT_MESSAGE),
  );
};

export const filterAnalyticsEvent = (
  event: CaptureResult | null,
  hostname: string,
): CaptureResult | null => {
  if (!event) return null;
  if (isLocalHostname(hostname)) return null;
  if (isNavigationAbort(event)) return null;

  return event;
};
