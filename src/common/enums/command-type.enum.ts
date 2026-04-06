export const CommandType = {
    SHELL: 'SHELL',
    RESTART: 'RESTART',
    KILL_PROCESS: 'KILL_PROCESS',
    GET_ACTIVE_USERS: 'GET_ACTIVE_USERS',
} as const

export type CommandType = typeof CommandType[keyof typeof CommandType]
