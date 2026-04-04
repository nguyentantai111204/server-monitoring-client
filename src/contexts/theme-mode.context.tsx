import { createContext, useContext, useState, useEffect } from 'react'

type ThemeMode = 'light' | 'dark'

interface ThemeModeContextValue {
    mode: ThemeMode
    toggleMode: () => void
}

const ThemeModeContext = createContext<ThemeModeContextValue>({
    mode: 'dark',
    toggleMode: () => {},
})

export const useThemeMode = () => useContext(ThemeModeContext)

interface ThemeModeProviderProps {
    children: React.ReactNode
}

export const ThemeModeProvider = ({ children }: ThemeModeProviderProps) => {
    const [mode, setMode] = useState<ThemeMode>(() => {
        return (localStorage.getItem('theme-mode') as ThemeMode) || 'dark'
    })

    useEffect(() => {
        localStorage.setItem('theme-mode', mode)
    }, [mode])

    const toggleMode = () => {
        setMode((prev) => (prev === 'light' ? 'dark' : 'light'))
    }

    return (
        <ThemeModeContext.Provider value={{ mode, toggleMode }}>
            {children}
        </ThemeModeContext.Provider>
    )
}
