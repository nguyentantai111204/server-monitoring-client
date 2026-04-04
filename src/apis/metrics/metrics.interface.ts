export interface Metric {
    id: number
    serverId: string
    cpuUsage: number
    ramUsage: number
    diskUsage: number
    networkIn: number
    networkOut: number
    timestamp: string
}

export interface MetricsQuery {
    from?: string
    to?: string
    limit?: number
}

export interface MetricsResponse {
    data: Metric[]
    total: number
}
