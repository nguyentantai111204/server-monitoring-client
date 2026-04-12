import { useState } from 'react'
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, InputAdornment, IconButton, Alert, Button, CircularProgress,
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { verifyServerPasswordApi } from '../../../apis/servers/servers.api'
import type { ServerSecrets } from '../../../apis/servers/servers.interface'

interface PasswordDialogProps {
    open: boolean
    serverId: string
    onSuccess: (secrets: ServerSecrets) => void
    onClose: () => void
}

export const PasswordDialog = ({ open, serverId, onSuccess, onClose }: PasswordDialogProps) => {
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

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>🔒 Verify Server Password</DialogTitle>
                <DialogContent>
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Enter this server's password to reveal the agent token and install command.
                    </Alert>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <TextField
                        fullWidth autoFocus label="Server Password"
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
