import { Request, Response, NextFunction } from "express";
import { CustomError, Logger } from "../../domain";
import { ResponseBuilder } from "../../shared/response/ResponseBuilder";

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  Logger.error("Error capturado por error handler", {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  if (error instanceof CustomError) {
    return res
      .status(error.statusCode)
      .json(ResponseBuilder.error(error.statusCode, error.message, req));
  }

  return res
    .status(500)
    .json(ResponseBuilder.error(500, "Error interno del servidor", req));
};
