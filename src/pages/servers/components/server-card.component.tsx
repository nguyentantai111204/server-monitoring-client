import { Box, Card, CardContent, Typography, Chip, Tooltip, IconButton } from '@mui/material'
import { ContentCopy } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { formatRelative, getStatusColor } from '../../../common/utils/format.utils'
import type { Server } from '../../../apis/servers/servers.interface'

interface ServerCardProps {
    server: Server
    onCopyToken: (token: string) => void
    onCopyInstallCmd: (token: string) => void
}

export const ServerCard = ({ server, onCopyToken, onCopyInstallCmd }: ServerCardProps) => {
    const navigate = useNavigate()

    return (
        <Card
            sx={{
                cursor: 'pointer',
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': { transform: 'translateY(-2px)' }
            }}
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
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation()
                                onCopyToken(server.agentToken)
                            }}
                        >
                            <ContentCopy fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                    <Typography variant="caption" color="text.disabled" noWrap sx={{ flexGrow: 1 }}>
                        Install Cmd: curl -sSL https://...
                    </Typography>
                    <Tooltip title="Copy install command">
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation()
                                onCopyInstallCmd(server.agentToken)
                            }}
                        >
                            <ContentCopy fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
                <Typography variant="caption" color="text.disabled">
                    {server.lastHeartbeat ? `Last seen ${formatRelative(server.lastHeartbeat)}` : 'Never connected'}
                </Typography>
            </CardContent>
        </Card>
    )
}
