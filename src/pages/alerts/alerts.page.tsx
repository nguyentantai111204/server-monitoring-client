import { useEffect, useState } from 'react'
import {
    Box, Stack, Typography, Card, CardContent, Button, Chip, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select,
    MenuItem, FormControl, InputLabel, FormHelperText, Skeleton, Switch,
    FormControlLabel
} from '@mui/material'
import { Add, Delete } from '@mui/icons-material'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { getAlertRulesApi, createAlertRuleApi, deleteAlertRuleApi, updateAlertRuleApi } from '../../apis/alerts/alerts.api'
import type { AlertRule } from '../../apis/alerts/alerts.interface'
import { MetricType } from '../../common/enums/metric-type.enum'
import { getServersApi } from '../../apis/servers/servers.api'
import type { Server } from '../../apis/servers/servers.interface'
import { useAppDispatch } from '../../redux/store.redux'
import { showSnackbar } from '../../redux/system/system.slice'

const METRIC_LABELS: Record<MetricType, string> = {
    [MetricType.CPU]: 'CPU Usage',
    [MetricType.RAM]: 'RAM Usage',
    [MetricType.DISK]: 'Disk Usage',
    [MetricType.NETWORK]: 'Network',
}

const validationSchema = Yup.object({
    serverId: Yup.string().required('Select a server'),
    metricType: Yup.string().required('Select a metric'),
    threshold: Yup.number().min(1).max(100).required('Threshold is required'),
})

export const AlertsPage = () => {
    const dispatch = useAppDispatch()
    const [rules, setRules] = useState<AlertRule[]>([])
    const [servers, setServers] = useState<Server[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)

    const fetchRules = () => {
        setLoading(true)
        Promise.all([getAlertRulesApi(), getServersApi()])
            .then(([r, s]) => { setRules(r); setServers(s) })
            .catch(() => dispatch(showSnackbar({ message: 'Failed to load alerts', severity: 'error' })))
            .finally(() => setLoading(false))
    }

    useEffect(() => { fetchRules() }, [])

    const formik = useFormik({
        initialValues: { serverId: '', metricType: MetricType.CPU, threshold: 80 },
        validationSchema,
        onSubmit: async (values, { resetForm }) => {
            try {
                await createAlertRuleApi({ ...values, threshold: Number(values.threshold) })
                dispatch(showSnackbar({ message: 'Alert rule created', severity: 'success' }))
                setDialogOpen(false)
                resetForm()
                fetchRules()
            } catch {
                dispatch(showSnackbar({ message: 'Failed to create alert rule', severity: 'error' }))
            }
        },
    })

    const handleDelete = async (id: string) => {
        try {
            await deleteAlertRuleApi(id)
            dispatch(showSnackbar({ message: 'Alert rule deleted', severity: 'success' }))
            fetchRules()
        } catch {
            dispatch(showSnackbar({ message: 'Failed to delete rule', severity: 'error' }))
        }
    }

    const handleToggle = async (rule: AlertRule) => {
        try {
            await updateAlertRuleApi(rule.id, { isActive: !rule.isActive })
            fetchRules()
        } catch {
            dispatch(showSnackbar({ message: 'Failed to update rule', severity: 'error' }))
        }
    }

    const serverName = (id: string) => servers.find((s) => s.id === id)?.name || id

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight={700}>Alert Rules</Typography>
                    <Typography variant="body2" color="text.secondary">Get notified when metrics exceed thresholds</Typography>
                </Box>
                <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>
                    Add Rule
                </Button>
            </Box>

            <Stack direction="row" flexWrap="wrap" gap={2}>
                {loading
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <Box key={i} sx={{ flex: '1 1 280px', minWidth: 240 }}>
                            <Skeleton variant="rounded" height={100} />
                        </Box>
                    ))
                    : rules.map((rule) => (
                        <Box key={rule.id} sx={{ flex: '1 1 280px', minWidth: 240 }}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box>
                                            <Typography fontWeight={600}>{serverName(rule.serverId)}</Typography>
                                            <Chip size="small" label={METRIC_LABELS[rule.metricType]} sx={{ mt: 0.5 }} />
                                        </Box>
                                        <IconButton size="small" color="error" onClick={() => handleDelete(rule.id)}>
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Threshold: <strong>{rule.threshold}%</strong>
                                        </Typography>
                                        <FormControlLabel
                                            control={<Switch checked={rule.isActive} size="small" onChange={() => handleToggle(rule)} />}
                                            label={rule.isActive ? 'Active' : 'Inactive'}
                                            labelPlacement="start"
                                            sx={{ m: 0, gap: 0.5 }}
                                        />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Box>
                    ))}

                {!loading && rules.length === 0 && (
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

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
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
                                {Object.values(MetricType).map((m) => <MenuItem key={m} value={m}>{METRIC_LABELS[m]}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth type="number" label="Threshold (%)" name="threshold"
                            value={formik.values.threshold} onChange={formik.handleChange} onBlur={formik.handleBlur}
                            error={formik.touched.threshold && Boolean(formik.errors.threshold)}
                            helperText={(formik.touched.threshold && formik.errors.threshold) || 'Alert triggers when metric exceeds this value'}
                            inputProps={{ min: 1, max: 100 }}
                        />
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="contained">Create Rule</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    )
}
