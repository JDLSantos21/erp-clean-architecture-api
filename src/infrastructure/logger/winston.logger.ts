import winston from "winston";
import { ILogger, LogContext } from "../../domain";
import { envs } from "../../config";

export class WinstonLogger implements ILogger {
  private logger: winston.Logger;

  constructor() {
    this.logger = this.createLogger();
  }

  private createLogger(): winston.Logger {
    const isDevelopment = envs.NODE_ENV !== "production";
    const logLevel = envs.LOG_LEVEL || (isDevelopment ? "debug" : "info");

    return winston.createLogger({
      level: logLevel,
      format: winston.format.combine(
        !isDevelopment
          ? winston.format.timestamp()
          : winston.format.uncolorize(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),

      transports: this.getTransports(isDevelopment),

      // Manejo de excepciones no capturadas
      exceptionHandlers: [
        new winston.transports.File({ filename: "logs/exceptions.log" }),
      ],

      // Manejo de promise rejections no capturadas
      rejectionHandlers: [
        new winston.transports.File({ filename: "logs/rejections.log" }),
      ],
    });
  }

  private getTransports(isDevelopment: boolean): winston.transport[] {
    const transports: winston.transport[] = [];

    if (envs.ENABLE_FILE_LOGGING) {
      transports.push(
        new winston.transports.File({
          filename: "logs/error.log",
          level: "error",
          maxsize: isDevelopment ? 1048576 : 5242880, // 1MB dev, 5MB prod
          maxFiles: isDevelopment ? 3 : 5,
        })
      );

      // Todos los logs van a archivo general
      transports.push(
        new winston.transports.File({
          filename: "logs/combined.log",
          maxsize: isDevelopment ? 512000 : 5242880, // 512KB dev, 5MB prod
          maxFiles: isDevelopment ? 2 : 5,
        })
      );
    }

    return transports;
  }

  private addConsoleTransport(): void {
    this.logger.add(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize({ all: true }),
          winston.format.simple()
        ),
      })
    );
  }

  private formatMessage(message: string, context?: LogContext): any {
    if (!context) {
      return { message };
    }

    if (context instanceof Error) {
      return {
        message,
        error: {
          name: context.name,
          message: context.message,
          stack: context.stack,
          ...(context as any),
        },
      };
    }

    return { message, ...context };
  }

  error(message: string, context?: LogContext): void {
    this.logger.error(this.formatMessage(message, context));
  }

  warn(message: string, context?: LogContext): void {
    this.logger.warn(this.formatMessage(message, context));
  }

  info(message: string, context?: LogContext): void {
    this.logger.info(this.formatMessage(message, context));
  }

  debug(message: string, context?: LogContext): void {
    this.logger.debug(this.formatMessage(message, context));
  }

  // Inicializar el logger según el entorno
  initialize(): void {
    const isDevelopment = envs.NODE_ENV !== "production";

    if (isDevelopment) {
      this.addConsoleTransport();
      this.info("✅ Logger initialized in development mode");
    } else {
      this.info("✅ Logger initialized in production mode");
    }
  }
}
