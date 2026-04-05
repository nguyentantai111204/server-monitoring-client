import { ServerStatus } from '../../common/enums/server-status.enum'

export interface ProcessInfo {
    pid: number
    user: string
    cpu: number
    mem: number
    command: string
}

export interface Server {
    id: string
    ownerId: string
    name: string
    ipAddress?: string
    agentToken: string
    status: ServerStatus
    lastHeartbeat?: string
    topProcesses?: ProcessInfo[] | null
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
