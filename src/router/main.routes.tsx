import type { RouteObject } from 'react-router-dom'
import { DashboardPage } from '../pages/dashboard/dashboard.page'
import { ServersPage } from '../pages/servers/servers.page'
import { AlertsPage } from '../pages/alerts/alerts.page'
import { ProfilePage } from '../pages/user/profile.page'
import { ServerDetailPage } from '@/pages/servers/server-detail.page'

export const mainRoutes: RouteObject[] = [
    { index: true, element: <DashboardPage /> },
    { path: 'servers', element: <ServersPage /> },
    { path: 'servers/:id', element: <ServerDetailPage /> },
    { path: 'alerts', element: <AlertsPage /> },
    { path: 'profile', element: <ProfilePage /> },
]
