export const ServerStatus = {
    ONLINE: 'ONLINE',
    OFFLINE: 'OFFLINE',
    PENDING: 'PENDING',
} as const

export type ServerStatus = typeof ServerStatus[keyof typeof ServerStatus]
