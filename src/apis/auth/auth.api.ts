import axiosInstance from '../../common/config/axios.config'
import type { LoginRequest, LoginResponse, RegisterRequest, RefreshTokenResponse } from './auth.interface'
import type { UserProfile } from '../users/users.interface'
import type { ApiResponse } from '../../common/interfaces/api.interface'

export const loginApi = async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await axiosInstance.post<ApiResponse<LoginResponse>>('/auth/login', data)
    return response.data.data
}

export const logoutApi = async (): Promise<void> => {
    await axiosInstance.post('/auth/logout')
}

export const refreshTokenApi = async (): Promise<RefreshTokenResponse> => {
    const response = await axiosInstance.post<ApiResponse<RefreshTokenResponse>>('/auth/refresh')
    return response.data.data
}

export const getProfileApi = async (): Promise<UserProfile> => {
    const response = await axiosInstance.get<ApiResponse<UserProfile>>('/users/me')
    return response.data.data
}

export const registerApi = async (data: RegisterRequest): Promise<void> => {
    await axiosInstance.post('/auth/register', data)
}
