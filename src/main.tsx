import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store, persistor } from './redux/store.redux'
import { PersistGate } from 'redux-persist/integration/react'
import { ThemeModeProvider } from './contexts/theme-mode.context'
import { AppThemeProvider } from './providers/theme.provider'
import './common/utils/dayjs.utils'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
    <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
            <ThemeModeProvider>
                <AppThemeProvider>
                    <App />
                </AppThemeProvider>
            </ThemeModeProvider>
        </PersistGate>
    </Provider>
)
