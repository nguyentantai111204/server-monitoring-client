export const CommandType = {
    SHELL: 'SHELL',
    RESTART: 'RESTART',
    KILL_PROCESS: 'KILL_PROCESS',
} as const

export type CommandType = typeof CommandType[keyof typeof CommandType]
