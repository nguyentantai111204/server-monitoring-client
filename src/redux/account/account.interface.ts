export interface UserProfile {
    id: string
    email: string
    fullName: string
    avatarUrl?: string
    phoneNumber?: string
    role?: string
}

export interface AccountState {
    user: UserProfile | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null
}
