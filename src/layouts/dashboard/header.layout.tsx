import { useState } from 'react'
import {
    AppBar, Toolbar, IconButton, Typography, Box,
    Avatar, Menu, MenuItem, Chip, Tooltip
} from '@mui/material'
import {
    Menu as MenuIcon, Brightness4, Brightness7,
    Logout, Person, Monitor
} from '@mui/icons-material'
import { useAppDispatch, useAppSelector } from '../../redux/store.redux'
import { selectCurrentUser } from '../../redux/account/account.selectors'
import { logout } from '../../redux/account/account.action'
import { useThemeMode } from '../../contexts/theme-mode.context'
import { APP_BAR_DESKTOP, APP_BAR_MOBILE, SIDEBAR_WIDTH } from '../../common/constants/style.constant'
import { useNavigate } from 'react-router-dom'

interface HeaderLayoutProps {
    onToggleSidebar: () => void
    isSidebarOpen: boolean
}

export const HeaderLayout = ({ onToggleSidebar }: HeaderLayoutProps) => {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const user = useAppSelector(selectCurrentUser)
    const { mode, toggleMode } = useThemeMode()
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

    const handleLogout = async () => {
        setAnchorEl(null)
        await dispatch(logout())
        navigate('/login')
    }

    return (
        <AppBar
            position="fixed"
            elevation={0}
            sx={{
                zIndex: (theme) => theme.zIndex.drawer + 1,
                height: { xs: APP_BAR_MOBILE, lg: APP_BAR_DESKTOP },
                backdropFilter: 'blur(8px)',
                bgcolor: (theme) =>
                    theme.palette.mode === 'dark'
                        ? 'rgba(26, 29, 39, 0.9)'
                        : 'rgba(255,255,255,0.9)',
                borderBottom: '1px solid',
                borderColor: 'divider',
                color: 'text.primary',
                width: { lg: `calc(100% - ${SIDEBAR_WIDTH}px)` },
                ml: { lg: `${SIDEBAR_WIDTH}px` },
            }}
        >
            <Toolbar sx={{ height: '100%', px: { xs: 2, lg: 3 } }}>
                {/* Mobile menu toggle */}
                <IconButton onClick={onToggleSidebar} sx={{ mr: 1, display: { lg: 'none' } }}>
                    <MenuIcon />
                </IconButton>

                {/* Logo (mobile) */}
                <Box sx={{ display: { xs: 'flex', lg: 'none' }, alignItems: 'center', gap: 1 }}>
                    <Monitor sx={{ color: 'primary.main', fontSize: 22 }} />
                    <Typography variant="subtitle1" fontWeight={700} color="primary">
                        ServerWatch
                    </Typography>
                </Box>

                <Box sx={{ flexGrow: 1 }} />

                {/* Theme toggle */}
                <Tooltip title={mode === 'dark' ? 'Light mode' : 'Dark mode'}>
                    <IconButton onClick={toggleMode} size="small" sx={{ mr: 1 }}>
                        {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
                    </IconButton>
                </Tooltip>

                {/* User avatar menu */}
                <Chip
                    avatar={
                        <Avatar sx={{ bgcolor: 'primary.main', width: 28, height: 28, fontSize: 12 }}>
                            {user?.fullName?.[0]?.toUpperCase() || 'U'}
                        </Avatar>
                    }
                    label={user?.fullName || 'User'}
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    variant="outlined"
                    sx={{ cursor: 'pointer', fontWeight: 500 }}
                />

                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={() => setAnchorEl(null)}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    PaperProps={{ sx: { mt: 1, minWidth: 180 } }}
                >
                    <MenuItem onClick={() => { setAnchorEl(null); navigate('/profile') }}>
                        <Person fontSize="small" sx={{ mr: 1.5 }} /> Profile
                    </MenuItem>
                    <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                        <Logout fontSize="small" sx={{ mr: 1.5 }} /> Logout
                    </MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    )
}
