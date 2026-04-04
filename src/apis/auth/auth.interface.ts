export interface LoginRequest {
    email: string
    password: string
}

export interface LoginResponse {
    user: UserProfile
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
    // Server uses httpOnly cookies — no token in body
}
