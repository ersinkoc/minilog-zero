/**
 * minilog-zero - Zero-dependency colorful console logger
 */

// ANSI color codes
const COLORS = {
  reset: '\x1b[0m',
  gray: '\x1b[90m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  green: '\x1b[32m',
} as const;

// Log level priorities
const LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  success: 3,
} as const;

// Emoji icons for each level
const ICONS = {
  debug: '🔍',
  info: 'ℹ️',
  warn: '⚠️',
  error: '❌',
  success: '✅',
} as const;

// Color mapping for each level
const LEVEL_COLORS = {
  debug: COLORS.gray,
  info: COLORS.cyan,
  warn: COLORS.yellow,
  error: COLORS.red,
  success: COLORS.green,
} as const;

// Type definitions
export type LogLevel = keyof typeof LEVELS;

export interface LoggerOptions {
  /** Prefix to prepend to all messages */
  prefix?: string;
  /** Whether to include ISO timestamp */
  timestamp?: boolean;
  /** Minimum log level to display */
  level?: LogLevel;
  /** Whether to show emoji icons */
  icons?: boolean;
}

export interface Logger {
  /** Log debug message (level 0) */
  debug(...args: unknown[]): void;
  /** Log info message (level 1) */
  info(...args: unknown[]): void;
  /** Log warning message (level 2) */
  warn(...args: unknown[]): void;
  /** Log error message (level 3) */
  error(...args: unknown[]): void;
  /** Log success message (level 3) */
  success(...args: unknown[]): void;
  /** Create a new logger instance with custom options */
  create(options?: LoggerOptions): Logger;
  /** Set the minimum log level */
  setLevel(level: LogLevel): void;
  /** Get the current log level */
  getLevel(): LogLevel;
}

/**
 * Safely stringify a value, handling circular references and special types
 * BUG-004 fix: Handle Error objects properly
 * BUG-005 fix: Handle Map, Set, RegExp and other built-in types
 */
function safeStringify(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';

  if (typeof value === 'object') {
    // Handle Error objects specially - they don't stringify well
    if (value instanceof Error) {
      const errorObj: Record<string, unknown> = {
        name: value.name,
        message: value.message,
      };
      if (value.stack) {
        errorObj.stack = value.stack;
      }
      // Include any custom properties on the error
      for (const key of Object.keys(value)) {
        errorObj[key] = (value as unknown as Record<string, unknown>)[key];
      }
      return JSON.stringify(errorObj, null, 2);
    }

    // Handle Map
    if (value instanceof Map) {
      return `Map(${value.size}) ${JSON.stringify(Object.fromEntries(value), null, 2)}`;
    }

    // Handle Set
    if (value instanceof Set) {
      return `Set(${value.size}) ${JSON.stringify([...value], null, 2)}`;
    }

    // Handle RegExp
    if (value instanceof RegExp) {
      return value.toString();
    }

    // Handle Date (already works but be explicit)
    if (value instanceof Date) {
      return value.toISOString();
    }

    try {
      const seen = new WeakSet();
      return JSON.stringify(value, (_key, val) => {
        if (typeof val === 'bigint') {
          return val.toString() + 'n';
        }
        if (typeof val === 'object' && val !== null) {
          if (seen.has(val)) {
            return '[Circular]';
          }
          seen.add(val);
        }
        return val;
      }, 2);
    } catch {
      return String(value);
    }
  }

  // Handle BigInt
  if (typeof value === 'bigint') {
    return value.toString() + 'n';
  }

  return String(value);
}

/**
 * Format arguments into a single string
 */
function formatArgs(args: unknown[]): string {
  return args.map(arg => {
    if (typeof arg === 'string') return arg;
    return safeStringify(arg);
  }).join(' ');
}

/**
 * Create a new logger instance
 */
function createLogger(options: LoggerOptions = {}): Logger {
  let currentLevel: LogLevel = options.level ?? 'debug';
  const prefix = options.prefix ?? '';
  const showTimestamp = options.timestamp ?? false;
  const showIcons = options.icons ?? true;

  /**
   * Check if a message at the given level should be logged
   */
  function shouldLog(level: LogLevel): boolean {
    return LEVELS[level] >= LEVELS[currentLevel];
  }

  /**
   * Format and output a log message
   */
  function log(level: LogLevel, args: unknown[]): void {
    if (!shouldLog(level)) return;

    const parts: string[] = [];
    const color = LEVEL_COLORS[level];

    // Add icon
    if (showIcons) {
      parts.push(ICONS[level]);
    }

    // Add timestamp
    if (showTimestamp) {
      parts.push(`${COLORS.gray}[${new Date().toISOString()}]${COLORS.reset}`);
    }

    // Add prefix
    if (prefix) {
      parts.push(`${color}${prefix}${COLORS.reset}`);
    }

    // Add level name
    parts.push(`${color}[${level.toUpperCase()}]${COLORS.reset}`);

    // Add message
    parts.push(formatArgs(args));

    // Output to appropriate console method
    const output = parts.join(' ');
    switch (level) {
      case 'error':
        console.error(output);
        break;
      case 'warn':
        console.warn(output);
        break;
      default:
        console.log(output);
    }
  }

  const logger: Logger = {
    debug: (...args: unknown[]) => log('debug', args),
    info: (...args: unknown[]) => log('info', args),
    warn: (...args: unknown[]) => log('warn', args),
    error: (...args: unknown[]) => log('error', args),
    success: (...args: unknown[]) => log('success', args),

    // BUG-003 fix: Child logger inherits parent options, can override
    create: (newOptions?: LoggerOptions) => createLogger({
      prefix,
      timestamp: showTimestamp,
      level: currentLevel,
      icons: showIcons,
      ...newOptions,
    }),

    setLevel: (level: LogLevel) => {
      // BUG-002 fix: Throw error for invalid levels instead of silent failure
      if (!(level in LEVELS)) {
        throw new TypeError(`Invalid log level: "${level}". Valid levels: ${Object.keys(LEVELS).join(', ')}`);
      }
      currentLevel = level;
    },

    getLevel: () => currentLevel,
  };

  return logger;
}

// Create and export default logger instance
const defaultLogger = createLogger();

export default defaultLogger;
export { createLogger as create };

// CommonJS compatibility
module.exports = defaultLogger;
module.exports.default = defaultLogger;
module.exports.create = createLogger;
