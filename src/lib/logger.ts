type LogLevel = "debug" | "info" | "warn" | "error";

interface LogPayload {
  level: LogLevel;
  scope: string;
  message: string;
  ts: string;
  [key: string]: unknown;
}

function write(level: LogLevel, scope: string, message: string, meta?: Record<string, unknown>) {
  const payload: LogPayload = {
    level,
    scope,
    message,
    ts: new Date().toISOString(),
    ...meta,
  };

  const line = JSON.stringify(payload);

  switch (level) {
    case "error":
      console.error(line);
      break;
    case "warn":
      console.warn(line);
      break;
    default:
      console.log(line);
  }
}

/** Strukturli log — production da JSON parse qilish oson */
export const logger = {
  debug(scope: string, message: string, meta?: Record<string, unknown>) {
    if (process.env.NODE_ENV !== "production") {
      write("debug", scope, message, meta);
    }
  },
  info(scope: string, message: string, meta?: Record<string, unknown>) {
    write("info", scope, message, meta);
  },
  warn(scope: string, message: string, meta?: Record<string, unknown>) {
    write("warn", scope, message, meta);
  },
  error(scope: string, message: string, meta?: Record<string, unknown>) {
    write("error", scope, message, meta);
  },
};
