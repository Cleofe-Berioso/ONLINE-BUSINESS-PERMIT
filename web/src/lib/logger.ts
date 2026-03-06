/**
 * Application Logger
 * Wraps console methods with log levels, structured output, and environment-aware filtering.
 * In production, only warn/error are shown. In development, all levels are shown.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

const LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const MIN_LEVEL: LogLevel =
  process.env.LOG_LEVEL as LogLevel ??
  (process.env.NODE_ENV === "production" ? "warn" : "debug");

function shouldLog(level: LogLevel): boolean {
  return LEVELS[level] >= LEVELS[MIN_LEVEL];
}

function fmt(level: LogLevel, message: string, meta?: unknown): string {
  const ts = new Date().toISOString();
  const base = `[${ts}] [${level.toUpperCase()}] ${message}`;
  if (meta !== undefined) {
    try {
      return `${base} ${typeof meta === "string" ? meta : JSON.stringify(meta)}`;
    } catch {
      return base;
    }
  }
  return base;
}

export const logger = {
  debug(message: string, meta?: unknown) {
    if (shouldLog("debug")) console.debug(fmt("debug", message, meta));
  },
  info(message: string, meta?: unknown) {
    if (shouldLog("info")) console.info(fmt("info", message, meta));
  },
  warn(message: string, meta?: unknown) {
    if (shouldLog("warn")) console.warn(fmt("warn", message, meta));
  },
  error(message: string, meta?: unknown) {
    if (shouldLog("error")) console.error(fmt("error", message, meta));
  },
};

export default logger;
