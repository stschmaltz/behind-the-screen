import posthog from 'posthog-js';
import { filterAnalyticsEvent } from './lib/analytics-filter';

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: '/ingest',
  ui_host: 'https://us.posthog.com',
  defaults: '2025-05-24',
  capture_exceptions: true,
  debug: process.env.NODE_ENV === 'development',
  before_send: (event) => filterAnalyticsEvent(event, window.location.hostname),
});
