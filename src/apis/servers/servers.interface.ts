import { ServerStatus } from '../../common/enums/server-status.enum'

export interface Server {
    id: string
    ownerId: string
    name: string
    ipAddress?: string
    agentToken: string
    status: ServerStatus
    lastHeartbeat?: string
    createdAt: string
    updatedAt: string
}

export interface CreateServerRequest {
    name: string
    ipAddress?: string
}

export interface UpdateServerRequest {
    name?: string
    ipAddress?: string
}

export interface ServerListResponse {
    data: Server[]
    total: number
    page: number
    limit: number
}
