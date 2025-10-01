import {
  getHttpStatusCode,
  createErrorMessage,
} from "../constants/error-codes.constants";
import { Logger } from "../utils";

export class CustomError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly message: string,
    public readonly errorCode?: string
  ) {
    super(message);
  }

  // Métodos originales (mantenidos para compatibilidad)
  static badRequest(message: string) {
    return new CustomError(400, message);
  }

  static unauthorized(message: string) {
    return new CustomError(401, message);
  }

  static forbidden(message: string) {
    return new CustomError(403, message);
  }

  static notFound(message: string) {
    return new CustomError(404, message);
  }

  static conflict(message: string) {
    return new CustomError(409, message);
  }

  static internalServer(
    message: string = "Internal Server Error",
    error?: any
  ) {
    return new CustomError(500, message);
  }

  // Nuevos métodos que usan códigos de error
  static withErrorCode(errorCode: string, customMessage?: string) {
    const statusCode = getHttpStatusCode(errorCode);
    const message = createErrorMessage(errorCode, customMessage);
    return new CustomError(statusCode, message, errorCode);
  }

  static badRequestWithCode(errorCode: string, customMessage?: string) {
    const message = createErrorMessage(errorCode, customMessage);
    return new CustomError(400, message, errorCode);
  }

  static unauthorizedWithCode(errorCode: string, customMessage?: string) {
    const message = createErrorMessage(errorCode, customMessage);
    return new CustomError(401, message, errorCode);
  }

  static forbiddenWithCode(errorCode: string, customMessage?: string) {
    const message = createErrorMessage(errorCode, customMessage);
    return new CustomError(403, message, errorCode);
  }

  static notFoundWithCode(errorCode: string, customMessage?: string) {
    const message = createErrorMessage(errorCode, customMessage);
    return new CustomError(404, message, errorCode);
  }

  static conflictWithCode(errorCode: string, customMessage?: string) {
    const message = createErrorMessage(errorCode, customMessage);
    return new CustomError(409, message, errorCode);
  }

  static internalServerWithCode(
    errorCode: string,
    customMessage?: string,
    error?: any
  ) {
    const message = createErrorMessage(
      errorCode,
      customMessage || "Internal Server Error"
    );
    return new CustomError(500, message, errorCode);
  }
}
