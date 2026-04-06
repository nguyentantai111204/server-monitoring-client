import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    Box, Stack, Typography, Card, CardContent, Chip,
    Button, Skeleton, Divider,
    CircularProgress,
} from '@mui/material'
import { ArrowBack, ContentCopy, SystemUpdateAlt, People, Refresh } from '@mui/icons-material'
import { getServerByIdApi, killProcessApi, updateAgentApi } from '../../apis/servers/servers.api'
import { getLatestMetricApi, getMetricsApi } from '../../apis/metrics/metrics.api'
import { getCommandByIdApi, requestActiveUsersApi } from '../../apis/commands/commands.api'
import { CommandStatus } from '../../common/enums/command-status.enum'
import useSWR from 'swr'
import { formatRelative, formatBytes, getStatusColor } from '../../common/utils/format.utils'
import { useAppDispatch } from '../../redux/store.redux'
import { showSnackbar } from '../../redux/system/system.slice'
import { MetricChartComponent } from './components/metric-chart.component'
import { MetricBar } from '../../components/metrics/metric-bar.component'
import { ProcessTable } from './components/process-table.component'


export const ServerDetailPage = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const [killingPid, setKillingPid] = useState<number | null>(null)
    const [isUpdating, setIsUpdating] = useState(false)
    const [activeUsersCommandId, setActiveUsersCommandId] = useState<string | null>(null)
    const [isFetchingUsers, setIsFetchingUsers] = useState(false)

    const { data: server, isLoading: loadingServer, mutate: mutateServer } = useSWR(
        id ? `/servers/${id}` : null,
        () => getServerByIdApi(id as string),
        {
            refreshInterval: 30000,
            onError: () => dispatch(showSnackbar({ message: 'Failed to load server data', severity: 'error' }))
        }
    )

    const isOffline = server?.status === 'OFFLINE'

    const { data: metric } = useSWR(
        id ? `/metrics/${id}/latest` : null,
        () => getLatestMetricApi(id as string).catch(() => null),
        { refreshInterval: isOffline ? 0 : 10000 }
    )

    const { data: history } = useSWR(
        id ? `/metrics/${id}/history` : null,
        () => getMetricsApi(id as string, { limit: 20 }).then(res => res ? (Array.isArray(res) ? res : res.data) : []),
        { refreshInterval: isOffline ? 0 : 10000 }
    )

    // Polling for active users command result
    const { data: userCommand } = useSWR(
        activeUsersCommandId ? `/commands/${activeUsersCommandId}` : null,
        () => getCommandByIdApi(activeUsersCommandId as string),
        {
            refreshInterval: (data) => (data?.status === CommandStatus.PENDING || data?.status === CommandStatus.PROCESSING) ? 2000 : 0,
            onSuccess: (data) => {
                if (data?.status === CommandStatus.SUCCESS || data?.status === CommandStatus.FAILED) {
                    setIsFetchingUsers(false)
                }
            }
        }
    )

    const loading = loadingServer && !server

    const copyToken = () => {
        if (!server) return
        navigator.clipboard.writeText(server.agentToken)
        dispatch(showSnackbar({ message: 'Agent token copied!', severity: 'info' }))
    }

    const handleKill = async (pid: number) => {
        if (!id) return
        setKillingPid(pid)
        try {
            await killProcessApi(id, pid)
            dispatch(showSnackbar({ message: `Kill signal sent to PID ${pid}`, severity: 'success' }))
            setTimeout(() => mutateServer(), 3000)
        } catch {
            dispatch(showSnackbar({ message: `Failed to kill PID ${pid}`, severity: 'error' }))
        } finally {
            setKillingPid(null)
        }
    }

    const handleUpdateAgent = async () => {
        if (!id) return
        setIsUpdating(true)
        try {
            await updateAgentApi(id)
            dispatch(showSnackbar({ message: 'Update command queued — agent will reinstall within 10s', severity: 'success' }))
        } catch {
            dispatch(showSnackbar({ message: 'Failed to queue update command', severity: 'error' }))
        } finally {
            setIsUpdating(false)
        }
    }

    const handleFetchUsers = async () => {
        if (!id) return
        setIsFetchingUsers(true)
        setActiveUsersCommandId(null)
        try {
            const cmd = await requestActiveUsersApi(id)
            setActiveUsersCommandId(cmd.id)
            dispatch(showSnackbar({ message: 'Fetching active users...', severity: 'info' }))
        } catch {
            dispatch(showSnackbar({ message: 'Failed to request active users', severity: 'error' }))
            setIsFetchingUsers(false)
        }
    }

    if (loading) return <Skeleton variant="rounded" height={400} />

    if (!server) return (
        <Box textAlign="center" py={8}>
            <Typography color="text.secondary">Server not found.</Typography>
            <Button onClick={() => navigate('/servers')} sx={{ mt: 2 }}>Back to Servers</Button>
        </Box>
    )

    const processes = server.topProcesses ?? []

    return (
        <Box>
            <Button startIcon={<ArrowBack />} onClick={() => navigate('/servers')} sx={{ mb: 2 }}>
                Back
            </Button>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Typography variant="h4" fontWeight={700}>{server.name}</Typography>
                <Chip label={server.status} color={getStatusColor(server.status)} />
            </Box>

            <Stack direction={{ xs: 'column', md: 'row' }} gap={2.5} alignItems="flex-start">
                {/* Server Info */}
                <Box sx={{ flex: '0 0 auto', width: { xs: '100%', md: '40%' } }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" fontWeight={600} mb={2}>Server Info</Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" color="text.secondary">IP Address</Typography>
                                    <Typography variant="body2">{server.ipAddress || '—'}</Typography>
                                </Box>
                                <Divider />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" color="text.secondary">Last Heartbeat</Typography>
                                    <Typography variant="body2">
                                        {server.lastHeartbeat ? formatRelative(server.lastHeartbeat) : 'Never'}
                                    </Typography>
                                </Box>
                                <Divider />
                                <Box>
                                    <Typography variant="body2" color="text.secondary" mb={0.5}>Agent Token</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                fontFamily: 'monospace',
                                                bgcolor: 'action.hover',
                                                px: 1, py: 0.5, borderRadius: 1,
                                                wordBreak: 'break-all', flexGrow: 1,
                                            }}
                                        >
                                            {server.agentToken}
                                        </Typography>
                                        <Button size="small" startIcon={<ContentCopy />} onClick={copyToken}>
                                            Copy
                                        </Button>
                                    </Box>
                                </Box>
                                <Divider />
                                <Box sx={{ pt: 0.5 }}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        color="warning"
                                        size="small"
                                        startIcon={isUpdating ? <CircularProgress size={14} color="inherit" /> : <SystemUpdateAlt />}
                                        disabled={isUpdating}
                                        onClick={handleUpdateAgent}
                                        sx={{ fontWeight: 600 }}
                                    >
                                        {isUpdating ? 'Sending update command...' : 'Update Agent'}
                                    </Button>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>

                {/* Latest Metrics */}
                <Box sx={{ flex: 1, width: { xs: '100%', md: 'auto' } }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" fontWeight={600} mb={2}>
                                Latest Metrics
                                {metric && (
                                    <Typography component="span" variant="caption" color="text.secondary" ml={1}>
                                        ({formatRelative(metric.timestamp)})
                                    </Typography>
                                )}
                            </Typography>
                            {metric ? (
                                <>
                                    <MetricBar label="CPU Usage" value={metric.cpuUsage} color="#6366f1" />
                                    <MetricBar label="RAM Usage" value={metric.ramUsage} color="#22d3ee" />
                                    <MetricBar label="Disk Usage" value={metric.diskUsage} color="#f59e0b" />
                                    <Divider sx={{ my: 1.5 }} />
                                    <Stack direction="row" gap={4}>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Network In</Typography>
                                            <Typography variant="body2" fontWeight={500}>
                                                {formatBytes(metric.networkIn)}/s
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Network Out</Typography>
                                            <Typography variant="body2" fontWeight={500}>
                                                {formatBytes(metric.networkOut)}/s
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </>
                            ) : (
                                <Typography color="text.secondary" textAlign="center" py={3}>
                                    No metrics yet. Install and configure the agent to start sending data.
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Box>
            </Stack>

            {/* Monitoring Charts */}
            {history && history.length > 0 && (
                <Box mt={3}>
                    <Stack direction={{ xs: 'column', lg: 'row' }} gap={2.5}>
                        <Box sx={{ flex: 1 }}>
                            <MetricChartComponent
                                data={history}
                                title="System Usage History"
                                type="usage"
                            />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <MetricChartComponent
                                data={history}
                                title="Network Traffic"
                                type="network"
                            />
                        </Box>
                    </Stack>
                </Box>
            )}

            {/* User Sessions Monitoring */}
            <Box mt={3}>
                <Card>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <People color="primary" />
                                <Typography variant="h6" fontWeight={600}>
                                    Logged-in Users
                                </Typography>
                            </Box>
                            <Button 
                                size="small" 
                                startIcon={isFetchingUsers ? <CircularProgress size={14} color="inherit" /> : <Refresh />}
                                onClick={handleFetchUsers}
                                disabled={isFetchingUsers || isOffline}
                            >
                                {isFetchingUsers ? 'Fetching...' : 'Refresh'}
                            </Button>
                        </Box>

                        {userCommand?.status === CommandStatus.SUCCESS ? (
                            <Box sx={{ 
                                bgcolor: 'grey.900', 
                                color: 'grey.100', 
                                p: 2, 
                                borderRadius: 1, 
                                fontFamily: 'monospace',
                                fontSize: '0.875rem',
                                whiteSpace: 'pre-wrap',
                                minHeight: 60
                            }}>
                                {userCommand.resultLog || 'No users logged in.'}
                            </Box>
                        ) : userCommand?.status === CommandStatus.FAILED ? (
                            <Typography color="error" variant="body2">
                                Error: {userCommand.resultLog || 'Failed to fetch users.'}
                            </Typography>
                        ) : isFetchingUsers ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
                                <CircularProgress size={20} />
                                <Typography variant="body2" color="text.secondary">
                                    Agent is processing command... (this may take up to 10s)
                                </Typography>
                            </Box>
                        ) : (
                            <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                                Click Refresh to see current logged-in users on this server.
                            </Typography>
                        )}
                    </CardContent>
                </Card>
            </Box>

            {/* Process Manager */}
            <Box mt={3}>
                <Card>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6" fontWeight={600}>
                                Process Manager
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Top 15 by CPU · refreshes every 30s
                            </Typography>
                        </Box>
                        <ProcessTable 
                            processes={processes} 
                            killingPid={killingPid} 
                            onKill={handleKill} 
                        />
                    </CardContent>
                </Card>
            </Box>
        </Box>
    )
}
