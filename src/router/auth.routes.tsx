import type { RouteObject } from 'react-router-dom'
import { AuthLayout } from '../layouts/auth/auth.layout'
import { LoginPage } from '../pages/auth/login.page'
import { RegisterPage } from '@/pages/auth/register.page'

export const authRoutes: RouteObject = {
    path: '/',
    element: <AuthLayout />,
    children: [
        { path: 'login', element: <LoginPage /> },
        { path: 'register', element: <RegisterPage /> },
    ],
}
