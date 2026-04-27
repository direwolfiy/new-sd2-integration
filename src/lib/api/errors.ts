export class ApiError extends Error {
  public readonly code: number;
  public readonly bizCode?: string;

  constructor(code: number, message: string, bizCode?: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.bizCode = bizCode;
  }
}
