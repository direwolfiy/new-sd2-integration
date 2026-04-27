export interface ApiResult<T> {
  code: number;
  message: string;
  bizCode?: string;
  data: T;
}

export interface PageResult<T> {
  list: T[];
  total: number;
  pageNum: number;
  pageSize: number;
  pages?: number;
}

export interface LoginResponse {
  id: number;
  username: string;
  roleId?: number;
  userType?: number;
  nickName?: string;
  defaultTenantId?: number;
  lastActiveTenantId?: number;
  tenantCount: number;
  token: string;
  accessToken: string;
  refreshToken: string;
  accessExpireAt: string;
  refreshExpireAt: string;
  signKey: string;
  signExpireAt: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}
