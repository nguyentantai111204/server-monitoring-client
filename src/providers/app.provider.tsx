import { AuthInitializer } from '../components/initializers/auth-initializer.component'
import { BrowserRouter } from 'react-router-dom'

interface AppProviderProps {
    children: React.ReactNode
}

export const AppProvider = ({ children }: AppProviderProps) => {
    return (
        <>
            <AuthInitializer />
            <BrowserRouter>
                {children}
            </BrowserRouter>
        </>
    )
}
