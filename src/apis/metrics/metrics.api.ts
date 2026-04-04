import axiosInstance from '../../common/config/axios.config'
import type { Metric, MetricsQuery, MetricsResponse } from './metrics.interface'

export const getMetricsApi = async (serverId: string, query?: MetricsQuery): Promise<MetricsResponse> => {
    const response = await axiosInstance.get<MetricsResponse>(`/metrics/${serverId}`, {
        params: query,
    })
    return response.data
}

export const getLatestMetricApi = async (serverId: string): Promise<Metric> => {
    const response = await axiosInstance.get<Metric>(`/metrics/${serverId}/latest`)
    return response.data
}
