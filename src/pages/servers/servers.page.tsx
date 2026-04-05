import { useState } from 'react'
import {
    Box, Stack, Typography, Button, Card, CardContent, Chip,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Skeleton, IconButton, Tooltip
} from '@mui/material'
import { Add, Refresh, ContentCopy } from '@mui/icons-material'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { getServersApi, createServerApi } from '../../apis/servers/servers.api'
import { formatRelative, getStatusColor } from '../../common/utils/format.utils'
import useSWR from 'swr'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../../redux/store.redux'
import { showSnackbar } from '../../redux/system/system.slice'

const validationSchema = Yup.object({
    name: Yup.string().required('Server name is required'),
    ipAddress: Yup.string().optional(),
})

export const ServersPage = () => {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const { data: servers = [], isLoading: loading, mutate: mutateServers } = useSWR('/servers', () => getServersApi(), {
        onError: () => dispatch(showSnackbar({ message: 'Failed to load servers', severity: 'error' }))
    })
    const [dialogOpen, setDialogOpen] = useState(false)
    const [creating, setCreating] = useState(false)

    const formik = useFormik({
        initialValues: { name: '', ipAddress: '' },
        validationSchema,
        onSubmit: async (values, { resetForm }) => {
            setCreating(true)
            try {
                await createServerApi({ name: values.name, ipAddress: values.ipAddress || undefined })
                dispatch(showSnackbar({ message: 'Server created successfully', severity: 'success' }))
                setDialogOpen(false)
                resetForm()
                mutateServers()
            } catch {
                dispatch(showSnackbar({ message: 'Failed to create server', severity: 'error' }))
            } finally {
                setCreating(false)
            }
        },
    })

    const copyToken = (token: string) => {
        navigator.clipboard.writeText(token)
        dispatch(showSnackbar({ message: 'Token copied!', severity: 'info' }))
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight={700}>Servers</Typography>
                    <Typography variant="body2" color="text.secondary">Manage your monitored servers</Typography>
                </Box>
                <Stack direction="row" gap={1}>
                    <Tooltip title="Refresh">
                        <IconButton onClick={() => mutateServers()}><Refresh /></IconButton>
                    </Tooltip>
                    <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>
                        Add Server
                    </Button>
                </Stack>
            </Box>

            <Stack direction="row" flexWrap="wrap" gap={2}>
                {loading
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <Box key={i} sx={{ flex: '1 1 280px', minWidth: 240 }}>
                            <Skeleton variant="rounded" height={140} />
                        </Box>
                    ))
                    : servers.map((server) => (
                        <Box key={server.id} sx={{ flex: '1 1 280px', minWidth: 240 }}>
                            <Card
                                sx={{ cursor: 'pointer', height: '100%', transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'translateY(-2px)' } }}
                                onClick={() => navigate(`/servers/${server.id}`)}
                            >
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography fontWeight={700}>{server.name}</Typography>
                                        <Chip size="small" label={server.status} color={getStatusColor(server.status)} />
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" mb={0.5}>
                                        IP: {server.ipAddress || '—'}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                                        <Typography variant="caption" color="text.disabled" noWrap sx={{ flexGrow: 1 }}>
                                            Token: {server.agentToken.slice(0, 24)}...
                                        </Typography>
                                        <Tooltip title="Copy agent token">
                                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); copyToken(server.agentToken) }}>
                                                <ContentCopy fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                                        <Typography variant="caption" color="text.disabled" noWrap sx={{ flexGrow: 1 }}>
                                            Install Cmd: curl -sSL https://ubuntu-server...
                                        </Typography>
                                        <Tooltip title="Copy install command">
                                            <IconButton size="small" onClick={(e) => {
                                                e.stopPropagation();
                                                copyToken(`curl -sSL https://ubuntu-server-management.duckdns.org/scripts/install.sh | sudo bash -s -- -t ${server.agentToken} -u https://ubuntu-server-management.duckdns.org`);
                                            }}>
                                                <ContentCopy fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                    <Typography variant="caption" color="text.disabled">
                                        {server.lastHeartbeat ? `Last seen ${formatRelative(server.lastHeartbeat)}` : 'Never connected'}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Box>
                    ))}

                {!loading && servers.length === 0 && (
                    <Box sx={{ width: '100%' }}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center', py: 6 }}>
                                <Typography color="text.secondary">No servers yet. Add your first server to get started.</Typography>
                                <Button variant="contained" startIcon={<Add />} sx={{ mt: 2 }} onClick={() => setDialogOpen(true)}>
                                    Add Server
                                </Button>
                            </CardContent>
                        </Card>
                    </Box>
                )}
            </Stack>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
                <form onSubmit={formik.handleSubmit}>
                    <DialogTitle>Add New Server</DialogTitle>
                    <DialogContent sx={{ pt: 1 }}>
                        <TextField
                            fullWidth autoFocus label="Server Name" name="name" sx={{ mb: 2, mt: 1 }}
                            value={formik.values.name} onChange={formik.handleChange} onBlur={formik.handleBlur}
                            error={formik.touched.name && Boolean(formik.errors.name)}
                            helperText={formik.touched.name && formik.errors.name}
                        />
                        <TextField
                            fullWidth label="IP Address (optional)" name="ipAddress"
                            value={formik.values.ipAddress} onChange={formik.handleChange} onBlur={formik.handleBlur}
                            helperText="Leave blank to auto-detect from agent"
                        />
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="contained" disabled={creating}>
                            {creating ? 'Creating…' : 'Create'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    )
}
