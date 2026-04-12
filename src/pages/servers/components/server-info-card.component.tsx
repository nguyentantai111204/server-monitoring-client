import { useState } from 'react'
import {
    Box, Card, CardContent, Typography, Divider,
    Button, CircularProgress,
} from '@mui/material'
import { LockOpen, SystemUpdateAlt, DeleteForever } from '@mui/icons-material'
import { LockedRow } from './locked-row.component'
import { PasswordDialog } from './password-dialog.component'
import { DeleteServerDialog } from './delete-server-dialog.component'
import { formatRelative } from '../../../common/utils/format.utils'
import type { ServerSecrets } from '../../../apis/servers/servers.interface'
import type { Server } from '../../../apis/servers/servers.interface'

interface ServerInfoCardProps {
    server: Server
    isUpdating: boolean
    onUpdateAgent: () => void
    onDeleted: () => void
}

export const ServerInfoCard = ({ server, isUpdating, onUpdateAgent, onDeleted }: ServerInfoCardProps) => {
    const [secrets, setSecrets] = useState<ServerSecrets | null>(null)
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

    return (
        <>
            <Card>
                <CardContent>
                    <Typography variant="h6" fontWeight={600} mb={2}>Server Info</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>

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

                        <LockedRow
                            label="Agent Token"
                            secrets={secrets}
                            value={(s) => s.agentToken}
                            onLockClick={() => setPasswordDialogOpen(true)}
                        />
                        <Divider />

                        <LockedRow
                            label="Install Command"
                            secrets={secrets}
                            value={(s) => s.oneLinerScript}
                            onLockClick={() => setPasswordDialogOpen(true)}
                        />

                        {secrets && (
                            <Button
                                size="small" startIcon={<LockOpen />} color="success"
                                onClick={() => setSecrets(null)}
                                sx={{ alignSelf: 'flex-end', mt: -0.5 }}
                            >
                                Lock again
                            </Button>
                        )}

                        <Divider />
                        <Box sx={{ pt: 0.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Button
                                fullWidth variant="outlined" color="warning" size="small"
                                startIcon={isUpdating ? <CircularProgress size={14} color="inherit" /> : <SystemUpdateAlt />}
                                disabled={isUpdating}
                                onClick={onUpdateAgent}
                                sx={{ fontWeight: 600 }}
                            >
                                {isUpdating ? 'Sending update command...' : 'Update Agent'}
                            </Button>
                            <Button
                                fullWidth variant="outlined" color="error" size="small"
                                startIcon={<DeleteForever />}
                                onClick={() => setDeleteDialogOpen(true)}
                                sx={{ fontWeight: 600 }}
                            >
                                Delete Server
                            </Button>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            <PasswordDialog
                open={passwordDialogOpen}
                serverId={server.id}
                onSuccess={(unlocked) => setSecrets(unlocked)}
                onClose={() => setPasswordDialogOpen(false)}
            />
            <DeleteServerDialog
                open={deleteDialogOpen}
                serverId={server.id}
                serverName={server.name}
                onClose={() => setDeleteDialogOpen(false)}
                onDeleted={onDeleted}
            />
        </>
    )
}
