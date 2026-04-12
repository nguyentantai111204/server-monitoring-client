import {
    Box, Typography, Card, Stack, Skeleton,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Avatar, Chip, IconButton, Tooltip,
} from '@mui/material'
import { Delete, Shield, Person } from '@mui/icons-material'
import useSWR from 'swr'
import { findAllUsersApi, removeUserApi } from '../../apis/users/users.api'
import { formatRelative } from '../../common/utils/format.utils'
import { useAppDispatch } from '../../redux/store.redux'
import { showSnackbar } from '../../redux/system/system.slice'

export const UsersManagementPage = () => {
    const dispatch = useAppDispatch()
    const { data: users = [], isLoading, mutate } = useSWR('/users', () => findAllUsersApi())

    const handleDelete = async (id: string, name: string) => {
        if (!window.confirm(`Are you sure you want to delete user ${name}?`)) return
        try {
            await removeUserApi(id)
            dispatch(showSnackbar({ message: 'User deleted', severity: 'success' }))
            mutate()
        } catch {
            dispatch(showSnackbar({ message: 'Failed to delete user', severity: 'error' }))
        }
    }

    return (
        <Box>
            <Typography variant="h4" fontWeight={800} mb={0.5}>User Management</Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
                Admin access to manage system users and roles
            </Typography>

            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'action.hover' }}>
                                <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Joined</TableCell>
                                <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton variant="text" width={150} /></TableCell>
                                        <TableCell><Skeleton variant="text" width={80} /></TableCell>
                                        <TableCell><Skeleton variant="text" width={100} /></TableCell>
                                        <TableCell align="right"><Skeleton variant="circular" width={32} height={32} /></TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                users.map((user: any) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <Stack direction="row" gap={2} alignItems="center">
                                                <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, fontSize: 14 }}>
                                                    {user.fullName[0]}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body2" fontWeight={600}>{user.fullName}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                                                </Box>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                size="small"
                                                icon={user.role === 'ADMIN' ? <Shield sx={{ fontSize: '12px !important' }} /> : <Person sx={{ fontSize: '12px !important' }} />}
                                                label={user.role}
                                                color={user.role === 'ADMIN' ? 'primary' : 'default'}
                                                variant="outlined"
                                                sx={{ fontWeight: 600, height: 24 }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="caption" color="text.secondary">
                                                {formatRelative(user.createdAt)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Delete">
                                                <IconButton size="small" color="error" onClick={() => handleDelete(user.id, user.fullName)}>
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>
        </Box>
    )
}
