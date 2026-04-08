export const CommandType = {
    SHELL: 'SHELL_CMD',
    RESTART: 'RESTART_SERVICE',
    KILL_PROCESS: 'KILL_PROCESS',
    GET_ACTIVE_USERS: 'GET_ACTIVE_USERS',
    UPDATE_AGENT: 'UPDATE_AGENT',
} as const

export type CommandType = typeof CommandType[keyof typeof CommandType]
