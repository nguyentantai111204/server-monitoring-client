import { Box, Typography, Button } from '@mui/material'
import { ContentCopy, Lock } from '@mui/icons-material'
import { useAppDispatch } from '../../../redux/store.redux'
import { showSnackbar } from '../../../redux/system/system.slice'
import type { ServerSecrets } from '../../../apis/servers/servers.interface'

interface LockedRowProps {
    label: string
    secrets: ServerSecrets | null
    value: (s: ServerSecrets) => string
    onLockClick: () => void
}

export const LockedRow = ({ label, secrets, value, onLockClick }: LockedRowProps) => {
    const dispatch = useAppDispatch()
    const revealed = !!secrets
    const text = revealed ? value(secrets!) : null

    const handleCopy = () => {
        if (!text) return
        navigator.clipboard.writeText(text)
        dispatch(showSnackbar({ message: `${label} copied!`, severity: 'info' }))
    }

    return (
        <Box>
            <Typography variant="body2" color="text.secondary" mb={0.5}>{label}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {revealed ? (
                    <Typography
                        variant="caption"
                        sx={{
                            fontFamily: 'monospace',
                            bgcolor: 'action.hover',
                            px: 1, py: 0.5, borderRadius: 1,
                            wordBreak: 'break-all', flexGrow: 1,
                        }}
                    >
                        {text}
                    </Typography>
                ) : (
                    <Typography variant="caption" color="text.disabled" sx={{ flexGrow: 1 }}>
                        •••••• (locked)
                    </Typography>
                )}
                {revealed ? (
                    <Button size="small" startIcon={<ContentCopy />} onClick={handleCopy}>Copy</Button>
                ) : (
                    <Button size="small" startIcon={<Lock />} onClick={onLockClick}>Reveal</Button>
                )}
            </Box>
        </Box>
    )
}
