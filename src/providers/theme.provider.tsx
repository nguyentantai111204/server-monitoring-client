import { useMemo } from 'react'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import { useThemeMode } from '../contexts/theme-mode.context'

interface AppThemeProviderProps {
    children: React.ReactNode
}

export const AppThemeProvider = ({ children }: AppThemeProviderProps) => {
    const { mode } = useThemeMode()

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                    primary: { main: '#6366f1' },
                    secondary: { main: '#22d3ee' },
                    background: {
                        default: mode === 'dark' ? '#0f1117' : '#f4f6f8',
                        paper: mode === 'dark' ? '#1a1d27' : '#ffffff',
                    },
                },
                shape: { borderRadius: 12 },
                typography: {
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                },
                components: {
                    MuiButton: {
                        styleOverrides: {
                            root: { textTransform: 'none', fontWeight: 600 },
                        },
                    },
                    MuiCard: {
                        styleOverrides: {
                            root: {
                                backgroundImage: 'none',
                                boxShadow: mode === 'dark'
                                    ? '0 4px 24px rgba(0,0,0,0.4)'
                                    : '0 2px 16px rgba(0,0,0,0.08)',
                            },
                        },
                    },
                },
            }),
        [mode]
    )

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    )
}
