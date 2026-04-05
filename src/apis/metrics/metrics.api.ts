import axiosInstance from '../../common/config/axios.config'
import type { Metric, MetricsQuery, MetricsResponse } from './metrics.interface'
import type { ApiResponse } from '../../common/interfaces/api.interface'

export const getMetricsApi = async (serverId: string, query?: MetricsQuery): Promise<MetricsResponse> => {
    const response = await axiosInstance.get<ApiResponse<MetricsResponse>>(`/metrics/${serverId}`, {
        params: query,
    })
    return response.data.data
}

export const getLatestMetricApi = async (serverId: string): Promise<Metric> => {
    const response = await axiosInstance.get<ApiResponse<Metric>>(`/metrics/${serverId}/latest`)
    return response.data.data
}
