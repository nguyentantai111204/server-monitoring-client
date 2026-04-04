import type { RouteObject } from 'react-router-dom'
import { authRoutes } from './auth.routes'
import { appRoutes } from './app.routes'
import { NotFoundPage } from '../pages/not-found/not-found.page'

export const routesConfig: RouteObject[] = [
    authRoutes,
    appRoutes,
    { path: '*', element: <NotFoundPage /> },
]
