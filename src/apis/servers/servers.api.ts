import axiosInstance from '../../common/config/axios.config'
import type { Server, ServerSecrets, CreateServerRequest, UpdateServerRequest } from './servers.interface'
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

/**
 * Verify the server password. Returns the agentToken and install script on success.
 * Throws a 401 error if the password is incorrect.
 */
export const verifyServerPasswordApi = async (id: string, password: string): Promise<ServerSecrets> => {
    const response = await axiosInstance.post<ApiResponse<ServerSecrets>>(`/servers/${id}/verify-password`, { password })
    return response.data.data
}

export const killProcessApi = async (serverId: string, pid: number): Promise<void> => {
    await axiosInstance.post(`/servers/${serverId}/kill-process`, { pid })
}

export const updateAgentApi = async (serverId: string): Promise<void> => {
    await axiosInstance.post(`/servers/${serverId}/update-agent`)
}
