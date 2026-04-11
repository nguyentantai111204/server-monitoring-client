import { useState } from 'react'
import {
    Box, Card, CardContent, Typography, Chip, Tooltip, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, CircularProgress, InputAdornment, Alert,
} from '@mui/material'
import { Lock, LockOpen, ContentCopy, Visibility, VisibilityOff } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { formatRelative, getStatusColor } from '../../../common/utils/format.utils'
import { verifyServerPasswordApi } from '../../../apis/servers/servers.api'
import type { Server, ServerSecrets } from '../../../apis/servers/servers.interface'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ServerCardProps {
    server: Server
}

// Which secret is being revealed
type SecretTarget = 'token' | 'install'

// ─── Password Dialog ──────────────────────────────────────────────────────────

interface PasswordDialogProps {
    open: boolean
    serverId: string
    target: SecretTarget
    onSuccess: (secrets: ServerSecrets) => void
    onClose: () => void
}

const PasswordDialog = ({ open, serverId, target, onSuccess, onClose }: PasswordDialogProps) => {
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleClose = () => {
        setPassword('')
        setError('')
        setLoading(false)
        onClose()
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!password) return

        setLoading(true)
        setError('')
        try {
            const secrets = await verifyServerPasswordApi(serverId, password)
            handleClose()
            onSuccess(secrets)
        } catch {
            setError('Incorrect password. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const label = target === 'token' ? 'Agent Token' : 'Install Command'

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle sx={{ pb: 1 }}>🔒 Unlock {label}</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                        Enter this server's password to reveal the {label}.
                    </Typography>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <TextField
                        fullWidth
                        autoFocus
                        label="Server Password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button type="submit" variant="contained" disabled={loading || !password}>
                        {loading ? <CircularProgress size={18} color="inherit" /> : 'Reveal'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

// ─── Secret Row ───────────────────────────────────────────────────────────────

interface SecretRowProps {
    label: string
    revealed: boolean
    value: string
    onLockClick: () => void
    onCopy: (value: string) => void
}

const SecretRow = ({ label, revealed, value, onLockClick, onCopy }: SecretRowProps) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Tooltip title={revealed ? 'Copy' : `Unlock ${label}`}>
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onLockClick() }}>
                {revealed ? <LockOpen fontSize="small" color="success" /> : <Lock fontSize="small" />}
            </IconButton>
        </Tooltip>
        <Typography variant="caption" color="text.disabled" noWrap sx={{ flexGrow: 1 }}>
            {label}: {revealed ? value.slice(0, 30) + '…' : '••••••••'}
        </Typography>
        {revealed && (
            <Tooltip title="Copy">
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); onCopy(value) }}>
                    <ContentCopy fontSize="small" />
                </IconButton>
            </Tooltip>
        )}
    </Box>
)

// ─── Main Component ───────────────────────────────────────────────────────────

export const ServerCard = ({ server }: ServerCardProps) => {
    const navigate = useNavigate()
    const [secrets, setSecrets] = useState<ServerSecrets | null>(null)
    const [dialogTarget, setDialogTarget] = useState<SecretTarget | null>(null)

    const handleLockClick = (target: SecretTarget) => {
        // If already unlocked, toggle visibility (e.g., copy)
        if (secrets) return
        setDialogTarget(target)
    }

    const handlePasswordSuccess = (unlocked: ServerSecrets) => {
        setSecrets(unlocked)
    }

    const copyToClipboard = (value: string) => {
        navigator.clipboard.writeText(value)
    }

    return (
        <>
            <Card
                sx={{
                    cursor: 'pointer',
                    height: '100%',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': { transform: 'translateY(-2px)' },
                }}
                onClick={() => navigate(`/servers/${server.id}`)}
            >
                <CardContent>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography fontWeight={700}>{server.name}</Typography>
                        <Chip size="small" label={server.status} color={getStatusColor(server.status)} />
                    </Box>

                    {/* IP */}
                    <Typography variant="body2" color="text.secondary" mb={1}>
                        IP: {server.ipAddress || '—'}
                    </Typography>

                    {/* Agent Token — locked until password is entered */}
                    <SecretRow
                        label="Agent Token"
                        revealed={!!secrets}
                        value={secrets?.agentToken ?? ''}
                        onLockClick={() => handleLockClick('token')}
                        onCopy={copyToClipboard}
                    />

                    {/* Install Command — same unlock action shares the same dialog */}
                    <SecretRow
                        label="Install Cmd"
                        revealed={!!secrets}
                        value={secrets?.oneLinerScript ?? ''}
                        onLockClick={() => handleLockClick('install')}
                        onCopy={copyToClipboard}
                    />

                    {/* Last heartbeat */}
                    <Typography variant="caption" color="text.disabled" mt={1} display="block">
                        {server.lastHeartbeat ? `Last seen ${formatRelative(server.lastHeartbeat)}` : 'Never connected'}
                    </Typography>
                </CardContent>
            </Card>

            {/* Password dialog — single dialog for both token and install cmd */}
            {dialogTarget && (
                <PasswordDialog
                    open={!!dialogTarget}
                    serverId={server.id}
                    target={dialogTarget}
                    onSuccess={handlePasswordSuccess}
                    onClose={() => setDialogTarget(null)}
                />
            )}
        </>
    )
}
