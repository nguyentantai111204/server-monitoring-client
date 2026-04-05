import axiosInstance from '../../common/config/axios.config'
import type { Server, CreateServerRequest, UpdateServerRequest } from './servers.interface'
import type { ApiResponse } from '../../common/interfaces/api.interface'

export const getServersApi = async (page = 1, limit = 20): Promise<Server[]> => {
    const response = await axiosInstance.get<ApiResponse<Server[]>>('/servers', {
        params: { page, limit },
    })
    return response.data.data
}

export const getServerByIdApi = async (id: string): Promise<Server> => {
    const response = await axiosInstance.get<ApiResponse<Server>>(`/servers/${id}`)
    return response.data.data
}

export const createServerApi = async (data: CreateServerRequest): Promise<Server> => {
    const response = await axiosInstance.post<ApiResponse<Server>>('/servers', data)
    return response.data.data
}

export const updateServerApi = async (id: string, data: UpdateServerRequest): Promise<Server> => {
    const response = await axiosInstance.patch<ApiResponse<Server>>(`/servers/${id}`, data)
    return response.data.data
}

export const deleteServerApi = async (id: string): Promise<void> => {
    await axiosInstance.delete(`/servers/${id}`)
}

export const regenerateAgentTokenApi = async (id: string): Promise<{ agentToken: string }> => {
    const response = await axiosInstance.post<ApiResponse<{ agentToken: string }>>(`/servers/${id}/regenerate-token`)
    return response.data.data
}
