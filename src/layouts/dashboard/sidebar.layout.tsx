import { useLocation, useNavigate } from 'react-router-dom'
import {
    Box, Drawer, List, ListItem, ListItemButton,
    ListItemIcon, ListItemText, Typography, Divider
} from '@mui/material'
import {
    Dashboard, Storage, NotificationsActive, Person, Monitor
} from '@mui/icons-material'
import { SIDEBAR_WIDTH } from '../../common/constants/style.constant'

const NAV_ITEMS = [
    { label: 'Dashboard', path: '/', icon: <Dashboard /> },
    { label: 'Servers', path: '/servers', icon: <Storage /> },
    { label: 'Alert Rules', path: '/alerts', icon: <NotificationsActive /> },
    { label: 'Profile', path: '/profile', icon: <Person /> },
]

interface SidebarLayoutProps {
    open: boolean
    onClose: () => void
}

const SidebarContent = () => {
    const location = useLocation()
    const navigate = useNavigate()

    const isActive = (path: string) =>
        path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box
                onClick={() => navigate('/')}
                sx={{
                    px: 3,
                    py: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    cursor: 'pointer',
                    '&:hover': { opacity: 0.8 }
                }}
            >
                <Box
                    sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 2,
                        bgcolor: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}
                >
                    <Monitor sx={{ color: 'white', fontSize: 20 }} />
                </Box>
                <Typography variant="h6" fontWeight={700} color="primary" noWrap>
                    ServerWatch
                </Typography>
            </Box>

            <Divider />

            {/* Nav Items */}
            <List sx={{ px: 1.5, py: 2, flexGrow: 1 }}>
                {NAV_ITEMS.map((item) => {
                    const active = isActive(item.path)
                    return (
                        <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                onClick={() => navigate(item.path)}
                                sx={{
                                    borderRadius: 2,
                                    py: 1,
                                    px: 1.5,
                                    bgcolor: active ? 'primary.main' : 'transparent',
                                    color: active ? 'white' : 'text.secondary',
                                    '&:hover': {
                                        bgcolor: active ? 'primary.dark' : 'action.hover',
                                    },
                                    transition: 'all 0.2s',
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 36,
                                        color: active ? 'white' : 'text.secondary',
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.label}
                                    primaryTypographyProps={{
                                        fontWeight: active ? 600 : 400,
                                        fontSize: 14,
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    )
                })}
            </List>

            {/* Footer */}
            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" color="text.disabled" display="block" textAlign="center">
                    ServerWatch v1.0
                </Typography>
            </Box>
        </Box>
    )
}

export const SidebarLayout = ({ open, onClose }: SidebarLayoutProps) => {
    const drawerStyle = {
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
            width: SIDEBAR_WIDTH,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
            backgroundImage: 'none',
        },
    }

    return (
        <>
            {/* Mobile drawer */}
            <Drawer
                variant="temporary"
                open={open}
                onClose={onClose}
                ModalProps={{ keepMounted: true }}
                sx={{ display: { xs: 'block', lg: 'none' }, ...drawerStyle }}
            >
                <SidebarContent />
            </Drawer>

            {/* Desktop permanent drawer */}
            <Drawer
                variant="permanent"
                sx={{ display: { xs: 'none', lg: 'block' }, ...drawerStyle }}
                open
            >
                <SidebarContent />
            </Drawer>
        </>
    )
}
