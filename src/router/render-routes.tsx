import { useRoutes } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'

export const RenderRoutes = ({ routes }: { routes: RouteObject[] }) => {
    return useRoutes(routes)
}
