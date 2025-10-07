import { Request, Response } from "express";
import { CustomError, Logger } from "../../domain";
import { ResponseBuilder } from "../../shared/response/ResponseBuilder";

export abstract class BaseController {
  protected handleError = (error: unknown, res: Response, req: Request) => {
    if (error instanceof CustomError) {
      return res
        .status(error.statusCode)
        .json(ResponseBuilder.error(error.statusCode, error.message, req));
    }

    Logger.error("Controller Error:", error);

    return res
      .status(500)
      .json(ResponseBuilder.error(500, "Internal server error", req));
  };

  protected handleSuccess<T>(
    res: Response,
    data: T,
    req: Request,
    statusCode = 200
  ): void {
    const response = ResponseBuilder.success(data, req);
    res.status(statusCode).json(response);
  }

  protected handleCreated<T>(res: Response, data: T, req: Request): void {
    this.handleSuccess(res, data, req, 201);
  }

  protected handleNoContent(res: Response): void {
    res.status(204).send();
  }

  protected handleSuccessWithPagination<T>(
    res: Response,
    data: T[],
    pagination: { page: number; limit: number; total: number },
    req: Request
  ): void {
    const response = ResponseBuilder.successWithPagination(
      data,
      pagination,
      req
    );
    res.status(200).json(response);
  }
}
