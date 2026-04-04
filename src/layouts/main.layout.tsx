import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Box } from '@mui/material'
import { HeaderLayout } from './dashboard/header.layout'
import { SidebarLayout } from './dashboard/sidebar.layout'
import {
    APP_BAR_DESKTOP,
    APP_BAR_MOBILE,
    SIDEBAR_WIDTH,
} from '../common/constants/style.constant'

export const MainLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
            <HeaderLayout
                onToggleSidebar={() => setSidebarOpen((v) => !v)}
                isSidebarOpen={sidebarOpen}
            />
            <SidebarLayout
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    minHeight: '100vh',
                    pt: { xs: `${APP_BAR_MOBILE}px`, lg: `${APP_BAR_DESKTOP}px` },
                    width: { lg: `calc(100% - ${SIDEBAR_WIDTH}px)` },
                    ml: { lg: `${SIDEBAR_WIDTH}px` },
                    overflow: 'auto',
                }}
            >
                <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1400, mx: 'auto' }}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    )
}
