import type { CaptureResult } from 'posthog-js';
import { filterAnalyticsEvent, isLocalHostname } from '../analytics-filter';

const buildEvent = (
  event: string,
  properties: Record<string, unknown> = {},
): CaptureResult => ({ event, properties }) as unknown as CaptureResult;

describe('filterAnalyticsEvent', () => {
  it('keeps events from the live site', () => {
    const event = buildEvent('turn_advanced');

    expect(filterAnalyticsEvent(event, 'www.encountermanager.com')).toBe(event);
  });

  it.each(['localhost', '127.0.0.1', '[::1]', 'app.localhost'])(
    'drops events from %s',
    (hostname) => {
      expect(isLocalHostname(hostname)).toBe(true);
      expect(
        filterAnalyticsEvent(buildEvent('turn_advanced'), hostname),
      ).toBeNull();
    },
  );

  it('drops the rejection thrown to cancel a navigation with unsaved changes', () => {
    const event = buildEvent('$exception', {
      $exception_list: [
        {
          type: 'UnhandledRejection',
          value:
            'Non-Error promise rejection captured with value: routeChange aborted.',
        },
      ],
    });

    expect(filterAnalyticsEvent(event, 'www.encountermanager.com')).toBeNull();
  });

  it('keeps other exceptions', () => {
    const event = buildEvent('$exception', {
      $exception_list: [{ type: 'Error', value: 'API request failed' }],
    });

    expect(filterAnalyticsEvent(event, 'www.encountermanager.com')).toBe(event);
  });

  it('passes through a null event', () => {
    expect(filterAnalyticsEvent(null, 'www.encountermanager.com')).toBeNull();
  });
});
