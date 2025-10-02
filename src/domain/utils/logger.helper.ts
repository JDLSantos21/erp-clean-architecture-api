import { DIContainer } from "../../infrastructure/di/container";
import { ILogger } from "../services";

export class Logger {
  private static getLoggerInstance(): ILogger {
    const container = DIContainer.getInstance();
    return container.resolve<ILogger>("Logger");
  }

  static error(message: string, context?: any): void {
    this.getLoggerInstance().error(message, context);
  }

  static warn(message: string, context?: any): void {
    this.getLoggerInstance().warn(message, context);
  }

  static info(message: string, context?: any): void {
    this.getLoggerInstance().info(message, context);
  }

  static debug(message: string, context?: any): void {
    this.getLoggerInstance().debug(message, context);
  }
}
