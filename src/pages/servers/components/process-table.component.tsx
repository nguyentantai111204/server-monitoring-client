import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Typography, Chip, Tooltip, IconButton, CircularProgress
} from '@mui/material'
import type { ProcessInfo } from '../../../apis/servers/servers.interface'

interface ProcessTableProps {
    processes: ProcessInfo[]
    killingPid: number | null
    onKill: (pid: number) => void
}

export const ProcessTable = ({ processes, killingPid, onKill }: ProcessTableProps) => {
    if (processes.length === 0) {
        return (
            <Typography color="text.secondary" textAlign="center" py={4}>
                No process data yet. Process list will appear after the next agent metric push.
            </Typography>
        )
    }

    return (
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
                                            onClick={() => onKill(proc.pid)}
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
    )
}
