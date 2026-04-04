import axiosInstance from '../../common/config/axios.config'
import type { Command, ExecuteCommandRequest } from './commands.interface'

export const executeCommandApi = async (data: ExecuteCommandRequest): Promise<Command> => {
    const response = await axiosInstance.post<Command>('/commands', data)
    return response.data
}

export const getCommandsApi = async (serverId: string): Promise<Command[]> => {
    const response = await axiosInstance.get<Command[]>('/commands', {
        params: { serverId },
    })
    return response.data
}

export const getCommandByIdApi = async (id: string): Promise<Command> => {
    const response = await axiosInstance.get<Command>(`/commands/${id}`)
    return response.data
}
