import type { RouteObject } from 'react-router-dom'
import { ProtectedRoute } from './protected.route'
import { mainRoutes } from './main.routes'
import { MainLayout } from '@/layouts/main.layout'

export const appRoutes: RouteObject = {
    path: '/',
    element: <ProtectedRoute />,
    children: [
        {
            element: <MainLayout />,
            children: mainRoutes,
        },
    ],
}
