import { MetricType } from '../../common/enums/metric-type.enum'

export interface AlertRule {
    id: string
    serverId: string
    metricType: MetricType
    threshold: number
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export interface AuditLog {
    id: number
    userId?: string
    action: string
    description?: string
    timestamp: string
    user?: { id: string; fullName: string; email: string }
}

export interface CreateAlertRuleRequest {
    serverId: string
    metricType: MetricType
    threshold: number
}

export interface UpdateAlertRuleRequest {
    threshold?: number
    isActive?: boolean
}
