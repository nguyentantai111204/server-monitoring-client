export const CommandStatus = {
    PENDING: 'PENDING',
    PROCESSING: 'PROCESSING',
    SUCCESS: 'SUCCESS',
    FAILED: 'FAILED',
} as const

export type CommandStatus = typeof CommandStatus[keyof typeof CommandStatus]
