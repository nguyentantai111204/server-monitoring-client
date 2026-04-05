import axiosInstance from '../../common/config/axios.config'
import type { UserProfile, UpdateProfileRequest } from './users.interface'
import type { ApiResponse } from '../../common/interfaces/api.interface'

export const getProfileApi = async (): Promise<UserProfile> => {
    const response = await axiosInstance.get<ApiResponse<UserProfile>>('/users/me')
    return response.data.data
}

export const updateProfileApi = async (data: UpdateProfileRequest): Promise<UserProfile> => {
    const response = await axiosInstance.patch<ApiResponse<UserProfile>>('/users/me', data)
    return response.data.data
}
