// Simple console-based logger to replace Winston

import pino from 'pino';

// Determine if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Create base Pino logger based on environment
let baseLogger: pino.Logger;

// In the browser, we need a different approach
if (isBrowser) {
  // Simple browser setup with basic options
  baseLogger = pino({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    browser: {
      asObject: true,
    },
  });
} else {
  // Server-side logger with pretty printing in development
  baseLogger = pino({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport:
      process.env.NODE_ENV !== 'production'
        ? { target: 'pino-pretty' }
        : undefined,
  });
}

// Create a wrapper with the same API as the previous logger
export const logger = {
  debug: (message: string, data?: unknown): void => {
    if (data) {
      baseLogger.debug(data, message);
    } else {
      baseLogger.debug(message);
    }
  },

  info: (message: string, data?: unknown): void => {
    if (data) {
      baseLogger.info(data, message);
    } else {
      baseLogger.info(message);
    }
  },

  warn: (message: string, data?: unknown): void => {
    if (data) {
      baseLogger.warn(data, message);
    } else {
      baseLogger.warn(message);
    }
  },

  error: (message: string, data?: unknown): void => {
    if (data) {
      baseLogger.error(data, message);
    } else {
      baseLogger.error(message);
    }
  },
};

// For compatibility with existing code
export { logger as enhancedLogger };
