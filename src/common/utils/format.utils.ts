import dayjs from './dayjs.utils'

export function formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
}

export function formatPercent(value: number, decimals = 1): string {
    return `${value.toFixed(decimals)}%`
}

export function formatDate(date: string | Date): string {
    return dayjs(date).format('HH:mm DD/MM/YYYY')
}


export function formatRelative(date: string | Date): string {
    return dayjs(date).fromNow()
}

export function formatNetworkSpeed(bytesPerSec: number): string {
    return `${formatBytes(bytesPerSec)}/s`
}

export function getStatusColor(status: string): 'success' | 'error' | 'warning' | 'default' {
    switch (status) {
        case 'ONLINE':
            return 'success'
        case 'OFFLINE':
            return 'error'
        case 'PENDING':
            return 'warning'
        default:
            return 'default'
    }
}
