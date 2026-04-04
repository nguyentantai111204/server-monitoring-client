import { CommandType } from '../../common/enums/command-type.enum'
import { CommandStatus } from '../../common/enums/command-status.enum'

export interface Command {
    id: string
    serverId: string
    createdBy: string
    commandType: CommandType
    payload: Record<string, unknown>
    status: CommandStatus
    resultLog?: string
    createdAt: string
    updatedAt: string
}

export interface ExecuteCommandRequest {
    serverId: string
    commandType: CommandType
    payload?: Record<string, unknown>
}
