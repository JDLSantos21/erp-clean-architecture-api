export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class PaginationHelper {
  static calculateOffset(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  static buildResponse<T>(
    data: T[],
    params: PaginationParams,
    total: number
  ): PaginationResult<T> {
    const totalPages = Math.ceil(total / params.limit);

    return {
      data,
      meta: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages,
      },
    };
  }
}
