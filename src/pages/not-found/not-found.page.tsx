import { Box, Typography, Button } from '@mui/material'
import { Home } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

export const NotFoundPage = () => {
    const navigate = useNavigate()

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.default',
                gap: 2,
            }}
        >
            <Typography
                variant="h1"
                fontWeight={900}
                sx={{
                    fontSize: '8rem',
                    background: 'linear-gradient(135deg, #6366f1, #22d3ee)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: 1,
                }}
            >
                404
            </Typography>
            <Typography variant="h5" fontWeight={600}>
                Page not found
            </Typography>
            <Typography color="text.secondary">
                The page you're looking for doesn't exist.
            </Typography>
            <Button
                variant="contained"
                startIcon={<Home />}
                onClick={() => navigate('/')}
                sx={{ mt: 1 }}
            >
                Go to Dashboard
            </Button>
        </Box>
    )
}
