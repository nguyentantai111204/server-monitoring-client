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
                    primary: { 
                        main: '#6366f1',
                        light: '#818cf8',
                        dark: '#4f46e5',
                        contrastText: '#ffffff',
                    },
                    secondary: { main: '#c084fc' },
                    success: { main: '#10b981' },
                    warning: { main: '#f59e0b' },
                    error: { main: '#ef4444' },
                    background: {
                        default: mode === 'dark' ? '#0b0e14' : '#f8fafc',
                        paper: mode === 'dark' ? '#151921' : '#ffffff',
                    },
                    divider: mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                },
                shape: { borderRadius: 16 },
                typography: {
                    fontFamily: '"Inter", sans-serif',
                    h4: { fontWeight: 800, letterSpacing: '-0.02em' },
                    h6: { fontWeight: 700, letterSpacing: '-0.01em' },
                    subtitle2: { fontWeight: 600 },
                    button: { fontWeight: 600, letterSpacing: '0.01em' },
                },
                components: {
                    MuiCssBaseline: {
                        styleOverrides: {
                            body: {
                                transition: 'background-color 0.3s ease',
                            }
                        }
                    },
                    MuiButton: {
                        styleOverrides: {
                            root: { 
                                textTransform: 'none', 
                                boxShadow: 'none',
                                '&:hover': { boxShadow: 'none' },
                            },
                            containedPrimary: {
                                backgroundImage: 'linear-gradient(to bottom right, #6366f1, #818cf8)',
                                '&:hover': {
                                    backgroundImage: 'linear-gradient(to bottom right, #4f46e5, #6366f1)',
                                }
                            }
                        },
                    },
                    MuiCard: {
                        styleOverrides: {
                            root: {
                                backgroundImage: 'none',
                                border: '1px solid',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                borderColor: mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                                boxShadow: mode === 'dark'
                                    ? '0 10px 30px -10px rgba(0,0,0,0.5)'
                                    : '0 4px 20px -5px rgba(0,0,0,0.05)',
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
