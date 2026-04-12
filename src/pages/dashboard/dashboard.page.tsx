import useSWR from 'swr'
import {
    Box, Stack, Card, CardContent, Typography, Chip,
    Skeleton, Avatar, Grid, Alert, AlertTitle, Button
} from '@mui/material'
import { Storage, CheckCircle, Error, HourglassEmpty, NotificationsActive } from '@mui/icons-material'
import { getServersApi } from '../../apis/servers/servers.api'
import { getAuditLogsApi } from '../../apis/alerts/alerts.api'
import { ServerStatus } from '../../common/enums/server-status.enum'
import { formatRelative, getStatusColor } from '../../common/utils/format.utils'
import { useNavigate } from 'react-router-dom'

const StatCard = ({
    label, value, color, icon
}: { label: string; value: number; color: string; icon: React.ReactNode }) => (
    <Card sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${color}15 0%, transparent 100%)`,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.2s',
        '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 24px -10px rgba(0,0,0,0.1)',
            borderColor: color,
        }
    }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2.5, py: 3 }}>
            <Avatar sx={{
                bgcolor: color,
                width: 56,
                height: 56,
                boxShadow: `0 8px 16px -4px ${color}40`,
                fontSize: 28
            }}>
                {icon}
            </Avatar>
            <Box>
                <Typography variant="h4" fontWeight={800} sx={{ lineHeight: 1 }}>{value}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>{label}</Typography>
            </Box>
        </CardContent>
    </Card>
)

export const DashboardPage = () => {
    const navigate = useNavigate()
    const { data: servers = [], isLoading: loading } = useSWR('/servers', () => getServersApi())
    const { data: alerts = [], isLoading: loadingAlerts } = useSWR('/alerts/recent', () => getAuditLogsApi(5))

    const online = servers.filter((s) => s.status === ServerStatus.ONLINE).length
    const offline = servers.filter((s) => s.status === ServerStatus.OFFLINE).length
    const pending = servers.filter((s) => s.status === ServerStatus.PENDING).length

    const healthScore = servers.length > 0 ? Math.round((online / servers.length) * 100) : 100

    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <Box>
                    <Typography variant="h4" fontWeight={800} letterSpacing="-0.02em">Infrastructure</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Real-time status of your global monitoring network
                    </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={0.5}>
                        SYSTEM HEALTH
                    </Typography>
                    <Chip
                        label={`${healthScore}% Operational`}
                        color={healthScore > 90 ? 'success' : healthScore > 70 ? 'warning' : 'error'}
                        sx={{ fontWeight: 700, borderRadius: 1.5 }}
                    />
                </Box>
            </Box>

            <Grid container spacing={3} mb={5}>
                {[
                    { label: 'Total Servers', value: servers.length, color: '#6366f1', icon: <Storage /> },
                    { label: 'Online Now', value: online, color: '#10b981', icon: <CheckCircle /> },
                    { label: 'Offline / Error', value: offline, color: '#ef4444', icon: <Error /> },
                    { label: 'Pending Setup', value: pending, color: '#f59e0b', icon: <HourglassEmpty /> },
                ].map((stat) => (
                    <Grid item xs={12} sm={6} lg={3} key={stat.label}>
                        {loading ? <Skeleton variant="rounded" height={112} /> : <StatCard {...stat} />}
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                    <Typography variant="h6" fontWeight={700} mb={2.5}>Recent Active Servers</Typography>
                    <Grid container spacing={2}>
                        {loading
                            ? Array.from({ length: 4 }).map((_, i) => (
                                <Grid item xs={12} sm={6} key={i}>
                                    <Skeleton variant="rounded" height={100} />
                                </Grid>
                            ))
                            : servers.slice(0, 6).map((server) => (
                                <Grid item xs={12} sm={6} key={server.id}>
                                    <Card
                                        sx={{
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            border: '1px solid transparent',
                                            '&:hover': {
                                                borderColor: 'primary.main',
                                                bgcolor: 'action.hover',
                                            }
                                        }}
                                        onClick={() => navigate(`/servers/${server.id}`)}
                                    >
                                        <CardContent>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <Box sx={{ minWidth: 0 }}>
                                                    <Typography fontWeight={700} noWrap>{server.name}</Typography>
                                                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                                                        {server.ipAddress || '0.0.0.0'}
                                                    </Typography>
                                                </Box>
                                                <Chip
                                                    size="small"
                                                    label={server.status}
                                                    color={getStatusColor(server.status)}
                                                    sx={{ fontWeight: 600, height: 20, fontSize: '0.625rem' }}
                                                />
                                            </Box>
                                            <Typography variant="caption" color="text.disabled" display="block" mt={1.5}>
                                                {server.lastHeartbeat ? `Activity ${formatRelative(server.lastHeartbeat)}` : 'Wait for connection'}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                    </Grid>
                </Grid>

                <Grid item xs={12} lg={4}>
                    <Typography variant="h6" fontWeight={700} mb={2.5}>Critical Alerts</Typography>
                    <Stack gap={2}>
                        {loadingAlerts ? (
                            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} variant="rounded" height={72} />)
                        ) : alerts.length === 0 ? (
                            <Card variant="outlined" sx={{ borderStyle: 'dashed', textAlign: 'center', py: 4 }}>
                                <Typography variant="body2" color="text.secondary">All systems clear.<br />No recent alerts.</Typography>
                            </Card>
                        ) : (
                            alerts.map((alert) => (
                                <Alert
                                    key={alert.id}
                                    severity="warning"
                                    icon={<NotificationsActive fontSize="small" />}
                                    sx={{ borderRadius: 2, '& .MuiAlert-message': { width: '100%', minWidth: 0 } }}
                                >
                                    <AlertTitle sx={{ fontWeight: 700, fontSize: '0.875rem', mb: 0 }}>
                                        {alert.description?.split(':')[0] || 'System Alert'}
                                    </AlertTitle>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 0.5 }}>
                                        <Typography variant="caption" sx={{ opacity: 0.8, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
                                            {alert.description?.split(':')[1]?.trim() || alert.action}
                                        </Typography>
                                        <Typography variant="caption" sx={{ opacity: 0.6, fontSize: '0.65rem', whiteSpace: 'nowrap', ml: 1 }}>
                                            {formatRelative(alert.timestamp)}
                                        </Typography>
                                    </Box>
                                </Alert>
                            ))
                        )}
                        <Button
                            variant="text"
                            size="small"
                            onClick={() => navigate('/alerts')}
                            sx={{ mt: 1, fontWeight: 600 }}
                        >
                            View All History
                        </Button>
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    )
}
