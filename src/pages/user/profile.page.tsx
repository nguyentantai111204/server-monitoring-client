import { useState } from 'react'
import {
    Box, Stack, Typography, Card, CardContent, Avatar, TextField,
    Button, Divider, CircularProgress
} from '@mui/material'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { useAppDispatch, useAppSelector } from '../../redux/store.redux'
import { selectCurrentUser } from '../../redux/account/account.selectors'
import { updateProfileLocal } from '../../redux/account/account.action'
import { updateProfileApi } from '../../apis/users/users.api'
import { showSnackbar } from '../../redux/system/system.slice'

const validationSchema = Yup.object({
    fullName: Yup.string().min(2).required('Full name is required'),
    phoneNumber: Yup.string().optional(),
})

export const ProfilePage = () => {
    const dispatch = useAppDispatch()
    const user = useAppSelector(selectCurrentUser)
    const [saving, setSaving] = useState(false)

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            fullName: user?.fullName || '',
            phoneNumber: user?.phoneNumber || '',
        },
        validationSchema,
        onSubmit: async (values) => {
            setSaving(true)
            try {
                const updated = await updateProfileApi(values)
                dispatch(updateProfileLocal(updated))
                dispatch(showSnackbar({ message: 'Profile updated!', severity: 'success' }))
            } catch {
                dispatch(showSnackbar({ message: 'Failed to update profile', severity: 'error' }))
            } finally {
                setSaving(false)
            }
        },
    })

    return (
        <Box>
            <Typography variant="h4" fontWeight={700} mb={0.5}>Profile</Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>Manage your account information</Typography>

            <Box sx={{ maxWidth: 720 }}>
                <Card>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                            <Avatar
                                sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: 24 }}
                                src={user?.avatarUrl}
                            >
                                {user?.fullName?.[0]?.toUpperCase() || 'U'}
                            </Avatar>
                            <Box>
                                <Typography variant="h6" fontWeight={700}>{user?.fullName}</Typography>
                                <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
                            </Box>
                        </Box>

                        <Divider sx={{ mb: 3 }} />

                        <Box component="form" onSubmit={formik.handleSubmit}>
                            <Stack gap={2}>
                                <TextField
                                    fullWidth label="Email" value={user?.email || ''} disabled
                                    helperText="Email cannot be changed"
                                />
                                <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
                                    <TextField
                                        fullWidth label="Full Name" name="fullName"
                                        value={formik.values.fullName} onChange={formik.handleChange} onBlur={formik.handleBlur}
                                        error={formik.touched.fullName && Boolean(formik.errors.fullName)}
                                        helperText={formik.touched.fullName && formik.errors.fullName}
                                    />
                                    <TextField
                                        fullWidth label="Phone Number" name="phoneNumber"
                                        value={formik.values.phoneNumber} onChange={formik.handleChange}
                                    />
                                </Stack>
                            </Stack>

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                                <Button type="submit" variant="contained" disabled={saving} sx={{ minWidth: 120 }}>
                                    {saving ? <CircularProgress size={20} color="inherit" /> : 'Save Changes'}
                                </Button>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    )
}
