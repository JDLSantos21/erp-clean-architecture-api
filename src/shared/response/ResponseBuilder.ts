export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: number;
    message: string;
    details?: string[];
  };
  meta?: {
    timestamp: string;
    path: string;
    method: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export class ResponseBuilder {
  static success<T>(data: T, req?: any, meta?: any): ApiResponse<T> {
    return {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        path: req?.originalUrl || "",
        method: req?.method || "",
        ...meta,
      },
    };
  }

  static error(
    code: number,
    message: string,
    req?: any,
    details?: any
  ): ApiResponse {
    return {
      success: false,
      error: {
        code,
        message,
        details,
      },
      meta: {
        timestamp: new Date().toISOString(),
        path: req?.originalUrl || "",
        method: req?.method || "",
      },
    };
  }

  static successWithPagination<T>(
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
    },
    req?: any
  ): ApiResponse<T[]> {
    const totalPages = Math.ceil(pagination.total / pagination.limit);

    return {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        path: req?.originalUrl || "",
        method: req?.method || "",
        pagination: {
          ...pagination,
          totalPages,
        },
      },
    };
  }
}
