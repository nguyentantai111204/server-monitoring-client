import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    Box, Stack, Typography, Card, CardContent, Chip,
    Button, Skeleton, LinearProgress, Divider,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    CircularProgress, Tooltip, IconButton,
} from '@mui/material'
import { ArrowBack, ContentCopy } from '@mui/icons-material'
import { getServerByIdApi, killProcessApi } from '../../apis/servers/servers.api'
import { getLatestMetricApi } from '../../apis/metrics/metrics.api'
import useSWR from 'swr'
import { formatRelative, formatPercent, formatBytes, getStatusColor } from '../../common/utils/format.utils'
import { useAppDispatch } from '../../redux/store.redux'
import { showSnackbar } from '../../redux/system/system.slice'

const MetricBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <Box mb={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" fontWeight={500}>{label}</Typography>
            <Typography variant="body2" color="text.secondary">{formatPercent(value)}</Typography>
        </Box>
        <LinearProgress
            variant="determinate"
            value={Math.min(value, 100)}
            sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: 'action.hover',
                '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 4 },
            }}
        />
    </Box>
)

export const ServerDetailPage = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const [killingPid, setKillingPid] = useState<number | null>(null)

    const { data: server, isLoading: loadingServer, mutate: mutateServer } = useSWR(
        id ? `/servers/${id}` : null,
        () => getServerByIdApi(id as string),
        {
            refreshInterval: 30000,
            onError: () => dispatch(showSnackbar({ message: 'Failed to load server data', severity: 'error' }))
        }
    )

    const { data: metric } = useSWR(
        id ? `/metrics/${id}/latest` : null,
        () => getLatestMetricApi(id as string).catch(() => null),
        { refreshInterval: 10000 }
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
                        {processes.length > 0 ? (
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 700, width: 70 }}>PID</TableCell>
                                            <TableCell sx={{ fontWeight: 700, width: 100 }}>User</TableCell>
                                            <TableCell sx={{ fontWeight: 700, width: 90 }} align="right">CPU %</TableCell>
                                            <TableCell sx={{ fontWeight: 700, width: 90 }} align="right">RAM %</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Command</TableCell>
                                            <TableCell sx={{ fontWeight: 700, width: 80 }} align="center">Kill</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {processes.map((proc, idx) => (
                                            <TableRow
                                                key={proc.pid}
                                                sx={{
                                                    bgcolor: idx % 2 === 0 ? 'transparent' : 'action.hover',
                                                    '&:hover': { bgcolor: 'action.selected' },
                                                    transition: 'background 0.15s',
                                                }}
                                            >
                                                <TableCell>
                                                    <Typography variant="caption" fontFamily="monospace" color="text.secondary">
                                                        {proc.pid}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="caption">{proc.user}</Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Chip
                                                        label={`${proc.cpu.toFixed(1)}%`}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: proc.cpu > 30 ? 'error.main' : proc.cpu > 10 ? 'warning.main' : 'action.hover',
                                                            color: proc.cpu > 10 ? '#fff' : 'text.primary',
                                                            fontWeight: 700,
                                                            fontSize: '0.7rem',
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="caption">{proc.mem.toFixed(1)}%</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography
                                                        variant="caption"
                                                        fontFamily="monospace"
                                                        sx={{
                                                            maxWidth: 300,
                                                            display: 'block',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                        }}
                                                    >
                                                        {proc.command}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Tooltip title={`Kill PID ${proc.pid}`} arrow>
                                                        <span>
                                                            <IconButton
                                                                size="small"
                                                                color="error"
                                                                disabled={killingPid === proc.pid}
                                                                onClick={() => handleKill(proc.pid)}
                                                                sx={{
                                                                    '&:hover': { bgcolor: 'error.dark', color: '#fff' },
                                                                    transition: 'all 0.2s',
                                                                }}
                                                            >
                                                                {killingPid === proc.pid
                                                                    ? <CircularProgress size={16} color="inherit" />
                                                                    : <span style={{ fontSize: 16 }}>💀</span>
                                                                }
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Typography color="text.secondary" textAlign="center" py={4}>
                                No process data yet. Process list will appear after the next agent metric push.
                            </Typography>
                        )}
                    </CardContent>
                </Card>
            </Box>
        </Box>
    )
}
