export const CommandStatus = {
    PENDING: 'PENDING',
    SENT: 'SENT',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
} as const

export type CommandStatus = typeof CommandStatus[keyof typeof CommandStatus]
