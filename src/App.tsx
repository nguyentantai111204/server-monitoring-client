import { RenderRoutes } from './router/render-routes'
import { routesConfig } from './router/routes.config'
import { GlobalSnackbar } from './components/snackbar/global-snackbar.component'
import { AppProvider } from './providers/app.provider'
import { SWRConfig } from 'swr'

export default function App() {
    return (
        <AppProvider>
            <SWRConfig value={{
                onErrorRetry: (error, _key, _config, revalidate, { retryCount }) => {
                    if (error?.status === 401 || error?.response?.status === 401) return
                    if (retryCount >= 3) return
                    setTimeout(() => revalidate({ retryCount }), 5000)
                }
            }}>
                <RenderRoutes routes={routesConfig} />
                <GlobalSnackbar />
            </SWRConfig>
        </AppProvider>
    )
}
