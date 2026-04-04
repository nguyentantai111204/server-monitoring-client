import { Outlet, Navigate } from 'react-router-dom'
import { Box, Paper, Typography } from '@mui/material'
import { useAppSelector } from '../../redux/store.redux'
import { selectIsAuthenticated } from '../../redux/account/account.selectors'
import { Monitor } from '@mui/icons-material'

export const AuthLayout = () => {
    const isAuthenticated = useAppSelector(selectIsAuthenticated)

    if (isAuthenticated) {
        return <Navigate to="/" replace />
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.default',
                background: (theme) =>
                    theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, #0f1117 0%, #1a1d27 100%)'
                        : 'linear-gradient(135deg, #f4f6f8 0%, #e8eaf6 100%)',
                p: 2,
            }}
        >
            <Box sx={{ width: '100%', maxWidth: 440 }}>
                {/* Logo */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4, justifyContent: 'center' }}>
                    <Box
                        sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 2,
                            bgcolor: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Monitor sx={{ color: 'white', fontSize: 24 }} />
                    </Box>
                    <Typography variant="h5" fontWeight={700} color="primary">
                        ServerWatch
                    </Typography>
                </Box>

                <Paper
                    elevation={0}
                    sx={{
                        p: 4,
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Outlet />
                </Paper>
            </Box>
        </Box>
    )
}
