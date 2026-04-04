import { RenderRoutes } from './router/render-routes'
import { routesConfig } from './router/routes.config'
import { GlobalSnackbar } from './components/snackbar/global-snackbar.component'
import { AppProvider } from './providers/app.provider'

export default function App() {
    return (
        <AppProvider>
            <RenderRoutes routes={routesConfig} />
            <GlobalSnackbar />
        </AppProvider>
    )
}
