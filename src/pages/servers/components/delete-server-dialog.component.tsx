import { useState } from 'react'
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, InputAdornment, IconButton, Alert, Button, CircularProgress,
} from '@mui/material'
import { Visibility, VisibilityOff, DeleteForever } from '@mui/icons-material'
import { deleteServerApi } from '../../../apis/servers/servers.api'
import { useAppDispatch } from '../../../redux/store.redux'
import { showSnackbar } from '../../../redux/system/system.slice'

interface DeleteServerDialogProps {
    open: boolean
    serverId: string
    serverName: string
    onClose: () => void
    onDeleted: () => void
}

export const DeleteServerDialog = ({ open, serverId, serverName, onClose, onDeleted }: DeleteServerDialogProps) => {
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const dispatch = useAppDispatch()

    const handleClose = () => {
        setPassword('')
        setError('')
        setLoading(false)
        onClose()
    }

    const handleDelete = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!password) return
        setLoading(true)
        setError('')
        try {
            await deleteServerApi(serverId, password)
            dispatch(showSnackbar({ message: `Server "${serverName}" deleted`, severity: 'success' }))
            handleClose()
            onDeleted()
        } catch {
            setError('Incorrect password or server not found.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
            <form onSubmit={handleDelete}>
                <DialogTitle sx={{ color: 'error.main' }}>🗑️ Delete Server</DialogTitle>
                <DialogContent>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        This will permanently delete <strong>{serverName}</strong> and all its data.
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
                    <Button type="submit" variant="contained" color="error" disabled={loading || !password}
                        startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <DeleteForever />}>
                        {loading ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}
