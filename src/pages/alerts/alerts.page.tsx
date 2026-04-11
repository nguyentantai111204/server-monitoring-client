import { useState } from 'react'
import {
    Box, Stack, Typography, Card, CardContent, Button, Chip, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select,
    MenuItem, FormControl, InputLabel, FormHelperText, Skeleton, Switch,
    FormControlLabel, Divider, Tabs, Tab, Tooltip,
} from '@mui/material'
import { Add, Delete, NotificationsActive, Rule } from '@mui/icons-material'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import useSWR from 'swr'
import {
    getAlertRulesApi, createAlertRuleApi, deleteAlertRuleApi,
    updateAlertRuleApi, getAuditLogsApi,
} from '../../apis/alerts/alerts.api'
import type { AlertRule } from '../../apis/alerts/alerts.interface'
import { MetricType } from '../../common/enums/metric-type.enum'
import { getServersApi } from '../../apis/servers/servers.api'
import { useAppDispatch } from '../../redux/store.redux'
import { showSnackbar } from '../../redux/system/system.slice'
import { formatRelative } from '../../common/utils/format.utils'


const METRIC_LABELS: Record<MetricType, string> = {
    [MetricType.CPU]: 'CPU Usage',
    [MetricType.RAM]: 'RAM Usage',
    [MetricType.DISK]: 'Disk Usage',
    [MetricType.NETWORK]: 'Network',
}

const METRIC_COLORS: Record<MetricType, string> = {
    [MetricType.CPU]: 'error',
    [MetricType.RAM]: 'warning',
    [MetricType.DISK]: 'info',
    [MetricType.NETWORK]: 'default',
}

const validationSchema = Yup.object({
    serverId: Yup.string().required('Select a server'),
    metricType: Yup.string().required('Select a metric'),
    threshold: Yup.number().min(1).max(100).required('Threshold is required'),
})


export const AlertsPage = () => {
    const dispatch = useAppDispatch()
    const [tab, setTab] = useState(0)
    const [dialogOpen, setDialogOpen] = useState(false)

    const { data: rules = [], isLoading: loadingRules, mutate: mutateRules } = useSWR(
        '/alerts',
        () => getAlertRulesApi(),
        { onError: () => dispatch(showSnackbar({ message: 'Failed to load alert rules', severity: 'error' })) },
    )

    const { data: auditLogs = [], isLoading: loadingLogs } = useSWR(
        '/alerts/audit-logs',
        () => getAuditLogsApi(100),
        { refreshInterval: 30000 },
    )

    const { data: servers = [] } = useSWR('/servers', () => getServersApi())

    const serverName = (id: string) => servers.find((s) => s.id === id)?.name ?? id


    const formik = useFormik({
        initialValues: { serverId: '', metricType: MetricType.CPU, threshold: 80 },
        validationSchema,
        onSubmit: async (values, { resetForm }) => {
            try {
                await createAlertRuleApi({ ...values, threshold: Number(values.threshold) })
                dispatch(showSnackbar({ message: 'Alert rule created', severity: 'success' }))
                setDialogOpen(false)
                resetForm()
                mutateRules()
            } catch {
                dispatch(showSnackbar({ message: 'Failed to create alert rule', severity: 'error' }))
            }
        },
    })

    const handleCloseDialog = () => {
        setDialogOpen(false)
        formik.resetForm()
    }


    const handleDelete = async (id: string) => {
        try {
            await deleteAlertRuleApi(id)
            dispatch(showSnackbar({ message: 'Alert rule deleted', severity: 'success' }))
            mutateRules()
        } catch {
            dispatch(showSnackbar({ message: 'Failed to delete rule', severity: 'error' }))
        }
    }

    const handleToggle = async (rule: AlertRule) => {
        try {
            await updateAlertRuleApi(rule.id, { isActive: !rule.isActive })
            mutateRules()
        } catch {
            dispatch(showSnackbar({ message: 'Failed to update rule', severity: 'error' }))
        }
    }


    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight={700}>Alerts</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage alert rules and view triggered alerts history
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>
                    Add Rule
                </Button>
            </Box>

            {/* Tabs */}
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
                <Tab icon={<Rule fontSize="small" />} iconPosition="start" label={`Rules (${rules.length})`} />
                <Tab icon={<NotificationsActive fontSize="small" />} iconPosition="start" label={`Triggered (${auditLogs.length})`} />
            </Tabs>

            {tab === 0 && (
                <Stack direction="row" flexWrap="wrap" gap={2}>
                    {loadingRules
                        ? Array.from({ length: 4 }).map((_, i) => (
                            <Box key={i} sx={{ flex: '1 1 280px', minWidth: 240 }}>
                                <Skeleton variant="rounded" height={120} />
                            </Box>
                        ))
                        : rules.map((rule) => (
                            <Box key={rule.id} sx={{ flex: '1 1 280px', minWidth: 240 }}>
                                <Card sx={{ opacity: rule.isActive ? 1 : 0.6 }}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <Box>
                                                <Typography fontWeight={600}>{serverName(rule.serverId)}</Typography>
                                                <Chip
                                                    size="small"
                                                    label={METRIC_LABELS[rule.metricType]}
                                                    color={METRIC_COLORS[rule.metricType] as any}
                                                    sx={{ mt: 0.5 }}
                                                />
                                            </Box>
                                            <Tooltip title="Delete rule">
                                                <IconButton size="small" color="error" onClick={() => handleDelete(rule.id)}>
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                        <Divider sx={{ my: 1.5 }} />
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Alert when &gt; <strong>{rule.threshold}%</strong>
                                            </Typography>
                                            <FormControlLabel
                                                control={<Switch checked={rule.isActive} size="small" onChange={() => handleToggle(rule)} />}
                                                label={rule.isActive ? 'Active' : 'Off'}
                                                labelPlacement="start"
                                                sx={{ m: 0, gap: 0.5 }}
                                            />
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Box>
                        ))}

                    {!loadingRules && rules.length === 0 && (
                        <Box sx={{ width: '100%' }}>
                            <Card>
                                <CardContent sx={{ textAlign: 'center', py: 6 }}>
                                    <Typography color="text.secondary">No alert rules yet.</Typography>
                                    <Button variant="contained" startIcon={<Add />} sx={{ mt: 2 }} onClick={() => setDialogOpen(true)}>
                                        Add Rule
                                    </Button>
                                </CardContent>
                            </Card>
                        </Box>
                    )}
                </Stack>
            )}

            {tab === 1 && (
                <Card>
                    <CardContent>
                        {loadingLogs ? (
                            <Stack gap={1}>
                                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} variant="rounded" height={52} />)}
                            </Stack>
                        ) : auditLogs.length === 0 ? (
                            <Typography color="text.secondary" textAlign="center" py={4}>
                                No alerts triggered yet. Create rules and they will appear here when fired.
                            </Typography>
                        ) : (
                            <Stack gap={1}>
                                {auditLogs.map((log) => (
                                    <Box
                                        key={log.id}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: 2,
                                            p: 1.5,
                                            borderRadius: 1,
                                            bgcolor: 'action.hover',
                                        }}
                                    >
                                        <NotificationsActive color="warning" fontSize="small" sx={{ mt: 0.3, flexShrink: 0 }} />
                                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                            <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                                                {log.description || log.action}
                                            </Typography>
                                            <Typography variant="caption" color="text.disabled">
                                                {formatRelative(log.timestamp)}
                                            </Typography>
                                        </Box>
                                        <Chip size="small" label="ALERT" color="warning" variant="outlined" sx={{ flexShrink: 0 }} />
                                    </Box>
                                ))}
                            </Stack>
                        )}
                    </CardContent>
                </Card>
            )}

            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
                <form onSubmit={formik.handleSubmit}>
                    <DialogTitle>Create Alert Rule</DialogTitle>
                    <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <FormControl fullWidth error={formik.touched.serverId && Boolean(formik.errors.serverId)}>
                            <InputLabel>Server</InputLabel>
                            <Select name="serverId" value={formik.values.serverId} onChange={formik.handleChange} label="Server">
                                {servers.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                            </Select>
                            {formik.touched.serverId && <FormHelperText>{formik.errors.serverId}</FormHelperText>}
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>Metric</InputLabel>
                            <Select name="metricType" value={formik.values.metricType} onChange={formik.handleChange} label="Metric">
                                {Object.values(MetricType).map((m) => (
                                    <MenuItem key={m} value={m}>{METRIC_LABELS[m]}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth type="number" label="Threshold (%)" name="threshold"
                            value={formik.values.threshold} onChange={formik.handleChange} onBlur={formik.handleBlur}
                            error={formik.touched.threshold && Boolean(formik.errors.threshold)}
                            helperText={(formik.touched.threshold && formik.errors.threshold) || 'Alert fires when this metric exceeds the threshold'}
                            inputProps={{ min: 1, max: 100 }}
                        />
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button type="submit" variant="contained">Create Rule</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    )
}
