import axiosInstance from '../../common/config/axios.config'
import type { UserProfile, UpdateProfileRequest } from './users.interface'

export const getProfileApi = async (): Promise<UserProfile> => {
    const response = await axiosInstance.get<UserProfile>('/users/me')
    return response.data
}

export const updateProfileApi = async (data: UpdateProfileRequest): Promise<UserProfile> => {
    const response = await axiosInstance.patch<UserProfile>('/users/me', data)
    return response.data
}
