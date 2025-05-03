import pino from 'pino';

const isBrowser = typeof window !== 'undefined';

function truncateObject<T>(obj: T, maxDepth = 8, currentDepth = 0): unknown {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return obj.toISOString();
  }

  if (
    typeof (obj as Record<string, unknown>)._id === 'object' &&
    (obj as Record<string, unknown>)._id !== null &&
    typeof ((obj as Record<string, unknown>)._id as { toString?: () => string })
      .toString === 'function'
  ) {
    return (
      (obj as Record<string, unknown>)._id as { toString: () => string }
    ).toString();
  }

  if (currentDepth >= maxDepth) {
    if (Array.isArray(obj)) {
      return `[Array with ${obj.length} items]`;
    }

    if (
      typeof (obj as { toString?: () => string }).toString === 'function' &&
      (obj as { toString: () => string }).toString() !== '[object Object]'
    ) {
      return (obj as { toString: () => string }).toString();
    }

    return '[Object]';
  }

  const result: Record<string, unknown> | unknown[] = Array.isArray(obj)
    ? []
    : {};

  if (Array.isArray(obj)) {
    const maxItems = 3;
    for (let i = 0; i < Math.min(obj.length, maxItems); i++) {
      (result as unknown[])[i] = truncateObject(
        obj[i],
        maxDepth,
        currentDepth + 1,
      );
    }
    if (obj.length > maxItems) {
      (result as unknown[]).push(`... (${obj.length - maxItems} more items)`);
    }
  } else {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (
          ['enemies', 'players', 'initiativeOrder'].includes(key) &&
          Array.isArray((obj as Record<string, unknown>)[key])
        ) {
          (result as Record<string, unknown>)[key] =
            `[Array with ${((obj as Record<string, unknown>)[key] as unknown[]).length} items]`;
        } else if (['_id', 'id', 'name', 'status'].includes(key)) {
          (result as Record<string, unknown>)[key] = (
            obj as Record<string, unknown>
          )[key];
        } else {
          (result as Record<string, unknown>)[key] = truncateObject(
            (obj as Record<string, unknown>)[key],
            maxDepth,
            currentDepth + 1,
          );
        }
      }
    }
  }

  return result;
}

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
      const truncatedData = truncateObject(data);
      baseLogger.debug(truncatedData, message);
    } else {
      baseLogger.debug(message);
    }
  },

  info: (message: string, data?: unknown): void => {
    if (data) {
      const truncatedData = truncateObject(data);
      baseLogger.info(truncatedData, message);
    } else {
      baseLogger.info(message);
    }
  },

  warn: (message: string, data?: unknown): void => {
    if (data) {
      const truncatedData = truncateObject(data);
      baseLogger.warn(truncatedData, message);
    } else {
      baseLogger.warn(message);
    }
  },

  error: (message: string, data?: unknown): void => {
    if (data) {
      const truncatedData = truncateObject(data);
      baseLogger.error(truncatedData, message);
    } else {
      baseLogger.error(message);
    }
  },
};

export { logger as enhancedLogger };
