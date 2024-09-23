export class ApiResponseCard<T> {
  constructor(
    public status: string,
    public data: T,
  ) {}
}
