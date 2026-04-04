import axiosInstance from '../../common/config/axios.config'
import type { Server, CreateServerRequest, UpdateServerRequest, ServerListResponse } from './servers.interface'

export const getServersApi = async (page = 1, limit = 20): Promise<ServerListResponse> => {
    const response = await axiosInstance.get<ServerListResponse>('/servers', {
        params: { page, limit },
    })
    return response.data
}

export const getServerByIdApi = async (id: string): Promise<Server> => {
    const response = await axiosInstance.get<Server>(`/servers/${id}`)
    return response.data
}

export const createServerApi = async (data: CreateServerRequest): Promise<Server> => {
    const response = await axiosInstance.post<Server>('/servers', data)
    return response.data
}

export const updateServerApi = async (id: string, data: UpdateServerRequest): Promise<Server> => {
    const response = await axiosInstance.patch<Server>(`/servers/${id}`, data)
    return response.data
}

export const deleteServerApi = async (id: string): Promise<void> => {
    await axiosInstance.delete(`/servers/${id}`)
}

export const regenerateAgentTokenApi = async (id: string): Promise<{ agentToken: string }> => {
    const response = await axiosInstance.post<{ agentToken: string }>(`/servers/${id}/regenerate-token`)
    return response.data
}
