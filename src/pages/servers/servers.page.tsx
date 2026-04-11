import { useState } from 'react'
import {
    Box, Stack, Typography, Button, Card, CardContent,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Skeleton, IconButton, Tooltip, InputAdornment,
} from '@mui/material'
import { Add, Refresh, Visibility, VisibilityOff } from '@mui/icons-material'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { getServersApi, createServerApi } from '../../apis/servers/servers.api'
import useSWR from 'swr'
import { useAppDispatch } from '../../redux/store.redux'
import { showSnackbar } from '../../redux/system/system.slice'
import { ServerCard } from './components/server-card.component'

const validationSchema = Yup.object({
    name: Yup.string().required('Server name is required'),
    ipAddress: Yup.string().optional(),
    password: Yup.string().required('Password is required').min(4, 'Password must be at least 4 characters'),
    confirmPassword: Yup.string()
        .required('Please confirm your password')
        .oneOf([Yup.ref('password')], 'Passwords do not match'),
})

export const ServersPage = () => {
    const dispatch = useAppDispatch()
    const { data: servers = [], isLoading: loading, mutate: mutateServers } = useSWR(
        '/servers',
        () => getServersApi(),
        { onError: () => dispatch(showSnackbar({ message: 'Failed to load servers', severity: 'error' })) },
    )
    const [dialogOpen, setDialogOpen] = useState(false)
    const [creating, setCreating] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const formik = useFormik({
        initialValues: { name: '', ipAddress: '', password: '', confirmPassword: '' },
        validationSchema,
        onSubmit: async (values, { resetForm }) => {
            setCreating(true)
            try {
                await createServerApi({
                    name: values.name,
                    ipAddress: values.ipAddress || undefined,
                    password: values.password,
                })
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

    const handleCloseDialog = () => {
        setDialogOpen(false)
        formik.resetForm()
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
                            <Skeleton variant="rounded" height={160} />
                        </Box>
                    ))
                    : servers.map((server) => (
                        <Box key={server.id} sx={{ flex: '1 1 280px', minWidth: 240 }}>
                            <ServerCard server={server} />
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

            {/* ─── Add Server Dialog ─────────────────────────────────────────────── */}
            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
                <form onSubmit={formik.handleSubmit}>
                    <DialogTitle>Add New Server</DialogTitle>
                    <DialogContent sx={{ pt: 1 }}>
                        {/* Server Name */}
                        <TextField
                            fullWidth autoFocus label="Server Name" name="name" sx={{ mb: 2, mt: 1 }}
                            value={formik.values.name} onChange={formik.handleChange} onBlur={formik.handleBlur}
                            error={formik.touched.name && Boolean(formik.errors.name)}
                            helperText={formik.touched.name && formik.errors.name}
                        />

                        {/* IP Address */}
                        <TextField
                            fullWidth label="IP Address (optional)" name="ipAddress" sx={{ mb: 2 }}
                            value={formik.values.ipAddress} onChange={formik.handleChange} onBlur={formik.handleBlur}
                            helperText="Leave blank to auto-detect from agent"
                        />

                        {/* Password */}
                        <TextField
                            fullWidth label="Server Password" name="password" sx={{ mb: 2 }}
                            type={showPassword ? 'text' : 'password'}
                            value={formik.values.password} onChange={formik.handleChange} onBlur={formik.handleBlur}
                            error={formik.touched.password && Boolean(formik.errors.password)}
                            helperText={
                                (formik.touched.password && formik.errors.password) ||
                                'Required to view the agent token and install command later'
                            }
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => setShowPassword(p => !p)}>
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {/* Confirm Password */}
                        <TextField
                            fullWidth label="Confirm Password" name="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={formik.values.confirmPassword} onChange={formik.handleChange} onBlur={formik.handleBlur}
                            error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                            helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => setShowConfirmPassword(p => !p)}>
                                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button type="submit" variant="contained" disabled={creating}>
                            {creating ? 'Creating…' : 'Create'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    )
}
