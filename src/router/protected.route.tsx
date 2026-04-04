import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppSelector } from '../redux/store.redux'
import { selectIsAuthenticated } from '../redux/account/account.selectors'

export const ProtectedRoute = () => {
    const isAuthenticated = useAppSelector(selectIsAuthenticated)
    const location = useLocation()

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    return <Outlet />
}
