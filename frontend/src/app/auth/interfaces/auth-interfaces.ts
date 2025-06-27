export interface ApiResponse<T> {
    statusCode: number;
    message: string;
    data?: T;
}

export interface AuthTokens {
    access_token: string;
    refresh_token: string;
    identifier: string;
}

export interface RefreshResponse {
    access_token: string;
    refresh_token: string;
}