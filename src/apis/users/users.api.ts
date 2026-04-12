import axiosInstance from '../../common/config/axios.config'
import type { UserProfile, UpdateProfileRequest, ChangePasswordRequest } from './users.interface'
import type { ApiResponse } from '../../common/interfaces/api.interface'

export const getProfileApi = async (): Promise<UserProfile> => {
    const response = await axiosInstance.get<ApiResponse<UserProfile>>('/users/me')
    return response.data.data
}

export const updateProfileApi = async (data: UpdateProfileRequest): Promise<UserProfile> => {
    const response = await axiosInstance.patch<ApiResponse<UserProfile>>('/users/me', data)
    return response.data.data
}

export const findAllUsersApi = async (): Promise<UserProfile[]> => {
    const response = await axiosInstance.get<ApiResponse<UserProfile[]>>('/users')
    return response.data.data
}

export const removeUserApi = async (id: string): Promise<void> => {
    await axiosInstance.delete(`/users/${id}`)
}

export const changePasswordApi = async (data: ChangePasswordRequest): Promise<void> => {
    await axiosInstance.post('/users/me/change-password', data)
}
