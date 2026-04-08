import axiosInstance from '../../common/config/axios.config'
import type { ApiResponse } from '../../common/interfaces/api.interface'
import type { Command, ExecuteCommandRequest } from './commands.interface'

export const executeCommandApi = async (data: ExecuteCommandRequest): Promise<Command> => {
    const response = await axiosInstance.post<ApiResponse<Command>>('/commands', data)
    return response.data.data
}

export const getCommandsApi = async (serverId: string): Promise<Command[]> => {
    const response = await axiosInstance.get<ApiResponse<Command[]>>('/commands', {
        params: { serverId },
    })
    return response.data.data
}

export const getCommandByIdApi = async (id: string): Promise<Command> => {
    const response = await axiosInstance.get<ApiResponse<Command>>(`/commands/${id}`)
    return response.data.data
}

export const requestActiveUsersApi = async (serverId: string): Promise<Command> => {
    const response = await axiosInstance.post<ApiResponse<Command>>(`/commands/server/${serverId}/active-users`)
    return response.data.data
}
