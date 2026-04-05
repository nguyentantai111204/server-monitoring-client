export interface LoginRequest {
    email: string
    password: string
}

export interface LoginResponse {
    user: UserProfile
    accessToken: string
    refreshToken: string
}

export interface UserProfile {
    id: string
    email: string
    fullName: string
    avatarUrl?: string
    phoneNumber?: string
    role?: string
}

export interface RegisterRequest {
    email: string
    password: string
    fullName: string
}

export interface RefreshTokenResponse {
    accessToken: string
    refreshToken: string
}
