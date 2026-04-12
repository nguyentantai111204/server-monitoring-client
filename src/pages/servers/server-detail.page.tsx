import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    Box, Stack, Typography, Card, CardContent, Chip,
    Button, Skeleton, Divider, CircularProgress, IconButton,
} from '@mui/material'
import { ArrowBack, People, Refresh } from '@mui/icons-material'
import { getServerByIdApi, killProcessApi, updateAgentApi } from '../../apis/servers/servers.api'
import { getLatestMetricApi, getMetricsApi } from '../../apis/metrics/metrics.api'
import { getCommandByIdApi, requestActiveUsersApi } from '../../apis/commands/commands.api'
import { CommandStatus } from '../../common/enums/command-status.enum'
import { AlertRulesCard } from './components/alert-rules-card.component'
import { ServerInfoCard } from './components/server-info-card.component'
import { MetricChartComponent } from './components/metric-chart.component'
import { ProcessTable } from './components/process-table.component'
import { PasswordDialog } from './components/password-dialog.component'
import { MetricBar } from '../../components/metrics/metric-bar.component'
import type { ServerSecrets } from '../../apis/servers/servers.interface'
import useSWR from 'swr'
import { formatRelative, formatBytes, getStatusColor } from '../../common/utils/format.utils'
import { useAppDispatch } from '../../redux/store.redux'
import { showSnackbar } from '../../redux/system/system.slice'

export const ServerDetailPage = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const dispatch = useAppDispatch()

    const [killingPid, setKillingPid] = useState<number | null>(null)
    const [isUpdating, setIsUpdating] = useState(false)
    const [activeUsersCommandId, setActiveUsersCommandId] = useState<string | null>(null)
    const [isFetchingUsers, setIsFetchingUsers] = useState(false)
    const [secrets, setSecrets] = useState<ServerSecrets | null>(null)
    const [unlockDialogOpen, setUnlockDialogOpen] = useState(false)

    const { data: server, isLoading: loadingServer, mutate: mutateServer } = useSWR(
        id ? `/servers/${id}` : null,
        () => getServerByIdApi(id as string),
        {
            refreshInterval: 30000,
            onError: () => dispatch(showSnackbar({ message: 'Failed to load server data', severity: 'error' })),
        },
    )

    const isOffline = server?.status === 'OFFLINE'

    const { data: metric } = useSWR(
        id ? `/metrics/${id}/latest` : null,
        () => getLatestMetricApi(id as string).catch(() => null),
        { refreshInterval: isOffline ? 0 : 10000 },
    )

    const { data: history } = useSWR(
        id ? `/metrics/${id}/history` : null,
        () => getMetricsApi(id as string, { limit: 20 }).then(res => res ? (Array.isArray(res) ? res : res.data) : []),
        { refreshInterval: isOffline ? 0 : 10000 },
    )

    const { data: userCommand } = useSWR(
        activeUsersCommandId ? `/commands/${activeUsersCommandId}` : null,
        () => getCommandByIdApi(activeUsersCommandId as string),
        {
            refreshInterval: (data) =>
                data?.status === CommandStatus.PENDING || data?.status === CommandStatus.PROCESSING ? 2000 : 0,
            onSuccess: (data) => {
                if (data?.status === CommandStatus.SUCCESS || data?.status === CommandStatus.FAILED) {
                    setIsFetchingUsers(false)
                }
            },
        },
    )

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

    if (loadingServer && !server) return <Skeleton variant="rounded" height={400} />

    if (!server) return (
        <Box textAlign="center" py={8}>
            <Typography color="text.secondary">Server not found.</Typography>
            <Button onClick={() => navigate('/servers')} sx={{ mt: 2 }}>Back to Servers</Button>
        </Box>
    )

    return (
        <Box>
            <Button startIcon={<ArrowBack />} onClick={() => navigate('/servers')} sx={{ mb: 2 }}>Back</Button>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Typography variant="h4" fontWeight={700}>{server.name}</Typography>
                <Chip label={server.status} color={getStatusColor(server.status)} />
            </Box>

            <Stack direction={{ xs: 'column', md: 'row' }} gap={2.5} alignItems="flex-start">
                <Box sx={{ flex: '0 0 auto', width: { xs: '100%', md: '40%' } }}>
                    <ServerInfoCard
                        server={server}
                        isUpdating={isUpdating}
                        onUpdateAgent={handleUpdateAgent}
                        onDeleted={() => navigate('/servers')}
                    />
                </Box>

                {/* ─── Latest Metrics ───────────────────────────────────────────── */}
                <Box sx={{ flex: 1, width: { xs: '100%', md: 'auto' } }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" fontWeight={600} mb={2}>
                                Latest Metrics
                                {metric && (
                                    <Typography variant="caption" color="text.secondary" ml={1}>
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
                                            <Typography variant="body2" fontWeight={500}>{formatBytes(metric.networkIn)}/s</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Network Out</Typography>
                                            <Typography variant="body2" fontWeight={500}>{formatBytes(metric.networkOut)}/s</Typography>
                                        </Box>
                                    </Stack>
                                </>
                            ) : (
                                <Box sx={{ py: 1 }}>
                                    <Typography color="text.secondary" mb={2}>
                                        No metrics yet. Install and configure the agent to start sending data.
                                    </Typography>
                                    <InstallationGuide
                                        secrets={secrets}
                                        onUnlock={() => setUnlockDialogOpen(true)}
                                    />
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Box>
            </Stack>

            <PasswordDialog
                open={unlockDialogOpen}
                serverId={id as string}
                onSuccess={setSecrets}
                onClose={() => setUnlockDialogOpen(false)}
            />

            {/* ─── History Charts ───────────────────────────────────────────────── */}
            {history && history.length > 0 && (
                <Box mt={3}>
                    <Stack direction={{ xs: 'column', lg: 'row' }} gap={2.5}>
                        <Box sx={{ flex: 1 }}>
                            <MetricChartComponent data={history} title="System Usage History" type="usage" />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <MetricChartComponent data={history} title="Network Traffic" type="network" />
                        </Box>
                    </Stack>
                </Box>
            )}

            {/* ─── System Users ─────────────────────────────────────────────────── */}
            <Box mt={3}>
                <Card>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <People color="primary" />
                                <Typography variant="h6" fontWeight={600}>System Users</Typography>
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
                                bgcolor: 'grey.900', color: 'grey.100', p: 2, borderRadius: 1,
                                fontFamily: 'monospace', fontSize: '0.875rem', whiteSpace: 'pre-wrap', minHeight: 60,
                            }}>
                                {userCommand.resultLog || 'No system users found.'}
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
                                Click Refresh to see all system users and their active sessions.
                            </Typography>
                        )}
                    </CardContent>
                </Card>
            </Box>

            <AlertRulesCard serverId={id as string} />

            <Box mt={3}>
                <Card>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6" fontWeight={600}>Process Manager</Typography>
                            <Typography variant="caption" color="text.secondary">Top 15 by CPU · refreshes every 30s</Typography>
                        </Box>
                        <ProcessTable processes={server.topProcesses ?? []} killingPid={killingPid} onKill={handleKill} />
                    </CardContent>
                </Card>
            </Box>
        </Box>
    )
}

const InstallationGuide = ({ secrets, onUnlock }: { secrets: ServerSecrets | null; onUnlock: () => void }) => {
    const dispatch = useAppDispatch()

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text)
        dispatch(showSnackbar({ message: `${label} copied!`, severity: 'success' }))
    }

    return (
        <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle2" fontWeight={700} mb={1}>Agent Installation</Typography>
            <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
                Run this command on your server to install and start the monitoring agent.
            </Typography>

            {secrets ? (
                <Stack gap={1.5}>
                    <Box>
                        <Typography variant="caption" fontWeight={700} gutterBottom>One-liner script</Typography>
                        <Box sx={{
                            display: 'flex', alignItems: 'center', gap: 1, p: 1, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider'
                        }}>
                            <Typography variant="caption" sx={{ fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexGrow: 1 }}>
                                {secrets.oneLinerScript}
                            </Typography>
                            <IconButton size="small" onClick={() => handleCopy(secrets.oneLinerScript, 'Install script')}>
                                <ContentCopy fontSize="inherit" />
                            </IconButton>
                        </Box>
                    </Box>
                    <Box>
                        <Typography variant="caption" fontWeight={700} gutterBottom>Agent Token (for manual config)</Typography>
                        <Box sx={{
                            display: 'flex', alignItems: 'center', gap: 1, p: 1, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider'
                        }}>
                            <Typography variant="caption" sx={{ fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexGrow: 1 }}>
                                {secrets.agentToken}
                            </Typography>
                            <IconButton size="small" onClick={() => handleCopy(secrets.agentToken, 'Token')}>
                                <ContentCopy fontSize="inherit" />
                            </IconButton>
                        </Box>
                    </Box>
                </Stack>
            ) : (
                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<LockOpen />}
                    onClick={onUnlock}
                    fullWidth
                >
                    Unlock Instructions
                </Button>
            )}
        </Box>
    )
}

import { ContentCopy, LockOpen } from '@mui/icons-material'
