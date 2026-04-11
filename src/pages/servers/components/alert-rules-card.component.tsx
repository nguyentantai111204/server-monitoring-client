import { useState } from 'react'
import {
    Box, Card, CardContent, Typography, Chip, IconButton,
    Switch, FormControlLabel, Button, Divider,
    Select, MenuItem, FormControl, InputLabel, CircularProgress, Tooltip,
} from '@mui/material'
import { NotificationsActive, Add, Delete } from '@mui/icons-material'
import useSWR from 'swr'
import {
    getAlertRulesApi, createAlertRuleApi,
    updateAlertRuleApi, deleteAlertRuleApi,
} from '../../../apis/alerts/alerts.api'
import { MetricType } from '../../../common/enums/metric-type.enum'
import { useAppDispatch } from '../../../redux/store.redux'
import { showSnackbar } from '../../../redux/system/system.slice'


const METRIC_LABELS: Record<MetricType, string> = {
    [MetricType.CPU]: 'CPU Usage',
    [MetricType.RAM]: 'RAM Usage',
    [MetricType.DISK]: 'Disk Usage',
    [MetricType.NETWORK]: 'Network',
}

const METRIC_COLORS: Partial<Record<MetricType, 'error' | 'warning' | 'info' | 'default'>> = {
    [MetricType.CPU]: 'error',
    [MetricType.RAM]: 'warning',
    [MetricType.DISK]: 'info',
    [MetricType.NETWORK]: 'default',
}


interface AlertRulesCardProps {
    serverId: string
}

export const AlertRulesCard = ({ serverId }: AlertRulesCardProps) => {
    const dispatch = useAppDispatch()
    const [adding, setAdding] = useState(false)
    const [newMetric, setNewMetric] = useState<MetricType>(MetricType.CPU)
    const [newThreshold, setNewThreshold] = useState(80)
    const [saving, setSaving] = useState(false)

    const { data: rules = [], isLoading, mutate } = useSWR(
        `/alerts?serverId=${serverId}`,
        () => getAlertRulesApi(serverId),
    )

    const handleAdd = async () => {
        setSaving(true)
        try {
            await createAlertRuleApi({ serverId, metricType: newMetric, threshold: newThreshold })
            dispatch(showSnackbar({ message: 'Alert rule added', severity: 'success' }))
            setAdding(false)
            mutate()
        } catch {
            dispatch(showSnackbar({ message: 'Failed to add rule', severity: 'error' }))
        } finally {
            setSaving(false)
        }
    }

    const handleToggle = async (id: string, current: boolean) => {
        try {
            await updateAlertRuleApi(id, { isActive: !current })
            mutate()
        } catch {
            dispatch(showSnackbar({ message: 'Failed to update rule', severity: 'error' }))
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await deleteAlertRuleApi(id)
            dispatch(showSnackbar({ message: 'Rule deleted', severity: 'success' }))
            mutate()
        } catch {
            dispatch(showSnackbar({ message: 'Failed to delete rule', severity: 'error' }))
        }
    }

    return (
        <Box mt={3}>
            <Card>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <NotificationsActive color="warning" />
                            <Typography variant="h6" fontWeight={600}>Alert Rules</Typography>
                            <Chip size="small" label={rules.length} variant="outlined" />
                        </Box>
                        {!adding && (
                            <Button size="small" startIcon={<Add />} onClick={() => setAdding(true)}>
                                Add Rule
                            </Button>
                        )}
                    </Box>

                    {adding && (
                        <Box sx={{ bgcolor: 'action.hover', borderRadius: 1, p: 2, mb: 2 }}>
                            <Typography variant="body2" fontWeight={600} mb={1.5}>New Alert Rule</Typography>
                            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                                <FormControl size="small" sx={{ minWidth: 140 }}>
                                    <InputLabel>Metric</InputLabel>
                                    <Select
                                        value={newMetric}
                                        label="Metric"
                                        onChange={(e) => setNewMetric(e.target.value as MetricType)}
                                    >
                                        {Object.values(MetricType).map((m) => (
                                            <MenuItem key={m} value={m}>{METRIC_LABELS[m]}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <FormControl size="small" sx={{ minWidth: 120 }}>
                                    <InputLabel>Threshold %</InputLabel>
                                    <Select
                                        value={newThreshold}
                                        label="Threshold %"
                                        onChange={(e) => setNewThreshold(Number(e.target.value))}
                                    >
                                        {[50, 60, 70, 75, 80, 85, 90, 95].map((v) => (
                                            <MenuItem key={v} value={v}>{v}%</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button variant="contained" size="small" onClick={handleAdd} disabled={saving}>
                                        {saving ? <CircularProgress size={14} color="inherit" /> : 'Save'}
                                    </Button>
                                    <Button size="small" onClick={() => setAdding(false)}>Cancel</Button>
                                </Box>
                            </Box>
                        </Box>
                    )}

                    {isLoading ? (
                        <Typography variant="body2" color="text.secondary">Loading rules…</Typography>
                    ) : rules.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                            No alert rules yet. Click "Add Rule" to create one.
                        </Typography>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                            {rules.map((rule, i) => (
                                <Box key={rule.id}>
                                    {i > 0 && <Divider />}
                                    <Box sx={{
                                        display: 'flex', alignItems: 'center',
                                        justifyContent: 'space-between', py: 1.5,
                                        opacity: rule.isActive ? 1 : 0.5,
                                    }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Chip
                                                size="small"
                                                label={METRIC_LABELS[rule.metricType]}
                                                color={METRIC_COLORS[rule.metricType] ?? 'default'}
                                            />
                                            <Typography variant="body2">
                                                &gt; <strong>{rule.threshold}%</strong>
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        size="small"
                                                        checked={rule.isActive}
                                                        onChange={() => handleToggle(rule.id, rule.isActive)}
                                                    />
                                                }
                                                label={<Typography variant="caption">{rule.isActive ? 'On' : 'Off'}</Typography>}
                                                labelPlacement="start"
                                                sx={{ m: 0, mr: 0.5 }}
                                            />
                                            <Tooltip title="Delete rule">
                                                <IconButton size="small" color="error" onClick={() => handleDelete(rule.id)}>
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Box>
    )
}
