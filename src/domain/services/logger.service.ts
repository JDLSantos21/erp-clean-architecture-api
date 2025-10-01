export interface LogLevel {
  ERROR: "error";
  WARN: "warn";
  INFO: "info";
  DEBUG: "debug";
}

export interface LogContext {
  requestId?: string;
  userId?: string;
  operation?: string;
  duration?: number;
  [key: string]: any;
}

export interface ILogger {
  error(message: string, context?: LogContext): void;

  warn(message: string, context?: LogContext): void;

  info(message: string, context?: LogContext): void;

  debug(message: string, context?: LogContext): void;
}
