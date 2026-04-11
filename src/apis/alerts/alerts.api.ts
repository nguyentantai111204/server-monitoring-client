import axiosInstance from '../../common/config/axios.config'
import type { AlertRule, AuditLog, CreateAlertRuleRequest, UpdateAlertRuleRequest } from './alerts.interface'
import type { ApiResponse } from '../../common/interfaces/api.interface'


export const getAlertRulesApi = async (serverId?: string): Promise<AlertRule[]> => {
    const response = await axiosInstance.get<ApiResponse<AlertRule[]>>('/alerts', {
        params: serverId ? { serverId } : undefined,
    })
    return response.data.data
}

export const createAlertRuleApi = async (data: CreateAlertRuleRequest): Promise<AlertRule> => {
    const response = await axiosInstance.post<ApiResponse<AlertRule>>('/alerts', data)
    return response.data.data
}

export const updateAlertRuleApi = async (id: string, data: UpdateAlertRuleRequest): Promise<AlertRule> => {
    const response = await axiosInstance.patch<ApiResponse<AlertRule>>(`/alerts/${id}`, data)
    return response.data.data
}

export const deleteAlertRuleApi = async (id: string): Promise<void> => {
    await axiosInstance.delete(`/alerts/${id}`)
}

export const getAuditLogsApi = async (limit = 100): Promise<AuditLog[]> => {
    const response = await axiosInstance.get<ApiResponse<AuditLog[]>>('/alerts/audit-logs', {
        params: { limit },
    })
    return response.data.data
}
