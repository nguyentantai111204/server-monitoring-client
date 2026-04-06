import { Box, Typography, LinearProgress } from '@mui/material'
import { formatPercent } from '../../common/utils/format.utils'

interface MetricBarProps {
    label: string
    value: number
    color: string
}

export const MetricBar = ({ label, value, color }: MetricBarProps) => (
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
