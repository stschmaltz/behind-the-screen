import pino from 'pino';

const isBrowser = typeof window !== 'undefined';

let baseLogger: pino.Logger;

if (isBrowser) {
  baseLogger = pino({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    browser: {
      asObject: true,
    },
  });
} else {
  baseLogger = pino({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport:
      process.env.NODE_ENV !== 'production'
        ? { target: 'pino-pretty' }
        : undefined,
  });
}

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

export { logger as enhancedLogger };
