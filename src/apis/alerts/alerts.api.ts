import axiosInstance from '../../common/config/axios.config'
import type { AlertRule, CreateAlertRuleRequest, UpdateAlertRuleRequest } from './alerts.interface'

export const getAlertRulesApi = async (serverId?: string): Promise<AlertRule[]> => {
    const response = await axiosInstance.get<AlertRule[]>('/alerts', {
        params: serverId ? { serverId } : undefined,
    })
    return response.data
}

export const createAlertRuleApi = async (data: CreateAlertRuleRequest): Promise<AlertRule> => {
    const response = await axiosInstance.post<AlertRule>('/alerts', data)
    return response.data
}

export const updateAlertRuleApi = async (id: string, data: UpdateAlertRuleRequest): Promise<AlertRule> => {
    const response = await axiosInstance.patch<AlertRule>(`/alerts/${id}`, data)
    return response.data
}

export const deleteAlertRuleApi = async (id: string): Promise<void> => {
    await axiosInstance.delete(`/alerts/${id}`)
}
