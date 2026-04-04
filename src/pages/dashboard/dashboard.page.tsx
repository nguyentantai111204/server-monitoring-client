import { useEffect, useState } from 'react'
import {
    Box, Stack, Card, CardContent, Typography, Chip,
    Skeleton, Avatar
} from '@mui/material'
import { Storage, CheckCircle, Error, HourglassEmpty } from '@mui/icons-material'
import { getServersApi } from '../../apis/servers/servers.api'
import type { Server } from '../../apis/servers/servers.interface'
import { ServerStatus } from '../../common/enums/server-status.enum'
import { formatRelative, getStatusColor } from '../../common/utils/format.utils'
import { useNavigate } from 'react-router-dom'

const StatCard = ({
    label, value, color, icon
}: { label: string; value: number; color: string; icon: React.ReactNode }) => (
    <Card>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: color, width: 48, height: 48 }}>
                {icon}
            </Avatar>
            <Box>
                <Typography variant="h4" fontWeight={700}>{value}</Typography>
                <Typography variant="body2" color="text.secondary">{label}</Typography>
            </Box>
        </CardContent>
    </Card>
)

export const DashboardPage = () => {
    const navigate = useNavigate()
    const [servers, setServers] = useState<Server[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getServersApi()
            .then((res) => setServers(res.data))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const online = servers.filter((s) => s.status === ServerStatus.ONLINE).length
    const offline = servers.filter((s) => s.status === ServerStatus.OFFLINE).length
    const pending = servers.filter((s) => s.status === ServerStatus.PENDING).length

    return (
        <Box>
            <Typography variant="h4" fontWeight={700} mb={0.5}>Dashboard</Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
                Overview of your server infrastructure
            </Typography>

            {/* Stat Cards */}
            <Stack direction="row" flexWrap="wrap" gap={2.5} mb={4}>
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <Box key={i} sx={{ flex: '1 1 200px', minWidth: 160 }}>
                            <Skeleton variant="rounded" height={96} />
                        </Box>
                    ))
                ) : (
                    [
                        { label: 'Total Servers', value: servers.length, color: '#6366f1', icon: <Storage /> },
                        { label: 'Online', value: online, color: '#22c55e', icon: <CheckCircle /> },
                        { label: 'Offline', value: offline, color: '#ef4444', icon: <Error /> },
                        { label: 'Pending', value: pending, color: '#f59e0b', icon: <HourglassEmpty /> },
                    ].map((stat) => (
                        <Box key={stat.label} sx={{ flex: '1 1 200px', minWidth: 160 }}>
                            <StatCard {...stat} />
                        </Box>
                    ))
                )}
            </Stack>

            <Typography variant="h6" fontWeight={600} mb={2}>Recent Servers</Typography>
            <Stack direction="row" flexWrap="wrap" gap={2}>
                {loading
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <Box key={i} sx={{ flex: '1 1 280px', minWidth: 240 }}>
                            <Skeleton variant="rounded" height={100} />
                        </Box>
                    ))
                    : servers.slice(0, 6).map((server) => (
                        <Box key={server.id} sx={{ flex: '1 1 280px', minWidth: 240 }}>
                            <Card
                                sx={{ cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)' } }}
                                onClick={() => navigate(`/servers/${server.id}`)}
                            >
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box>
                                            <Typography fontWeight={600} noWrap>{server.name}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {server.ipAddress || 'No IP'}
                                            </Typography>
                                        </Box>
                                        <Chip
                                            size="small"
                                            label={server.status}
                                            color={getStatusColor(server.status)}
                                        />
                                    </Box>
                                    <Typography variant="caption" color="text.disabled" display="block" mt={1}>
                                        {server.lastHeartbeat ? `Last seen ${formatRelative(server.lastHeartbeat)}` : 'Never connected'}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Box>
                    ))}
            </Stack>
        </Box>
    )
}
