export interface FilterParams<T> {
  filters?: Partial<T>;
  skip?: number;
  limit?: number;
}
