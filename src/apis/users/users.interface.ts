export interface UserProfile {
    id: string
    email: string
    fullName: string
    avatarUrl?: string
    phoneNumber?: string
    role?: string
}

export interface UpdateProfileRequest {
    fullName?: string
    phoneNumber?: string
    avatarUrl?: string
}

export interface ChangePasswordRequest {
    oldPassword: string
    newPassword: string
}
