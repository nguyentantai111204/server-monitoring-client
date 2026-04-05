export const MetricType = {
    CPU: 'CPU',
    RAM: 'RAM',
    DISK: 'DISK',
    NETWORK: 'NETWORK',
} as const

export type MetricType = typeof MetricType[keyof typeof MetricType]
