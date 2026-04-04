import { useState } from 'react'
import {
    Box, TextField, Button, Typography, Link, Alert, CircularProgress, InputAdornment, IconButton
} from '@mui/material'
import { Person, Email, Lock, Visibility, VisibilityOff } from '@mui/icons-material'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../redux/store.redux'
import { signup } from '../../redux/account/account.action'
import { selectAccountError, selectAccountLoading } from '../../redux/account/account.selectors'
import { showSnackbar } from '../../redux/system/system.slice'

const validationSchema = Yup.object({
    fullName: Yup.string().min(2, 'At least 2 characters').required('Full name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().min(6, 'At least 6 characters').required('Password is required'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Please confirm your password'),
})

export const RegisterPage = () => {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const isLoading = useAppSelector(selectAccountLoading)
    const error = useAppSelector(selectAccountError)
    const [showPassword, setShowPassword] = useState(false)

    const formik = useFormik({
        initialValues: { fullName: '', email: '', password: '', confirmPassword: '' },
        validationSchema,
        onSubmit: async (values) => {
            const result = await dispatch(signup({
                fullName: values.fullName,
                email: values.email,
                password: values.password,
            }))
            if (signup.fulfilled.match(result)) {
                dispatch(showSnackbar({ message: 'Account created! Please sign in.', severity: 'success' }))
                navigate('/login')
            }
        },
    })

    return (
        <Box component="form" onSubmit={formik.handleSubmit}>
            <Typography variant="h5" fontWeight={700} mb={0.5}>
                Create Account
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
                Get started with server monitoring
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TextField
                fullWidth label="Full Name" name="fullName"
                value={formik.values.fullName} onChange={formik.handleChange} onBlur={formik.handleBlur}
                error={formik.touched.fullName && Boolean(formik.errors.fullName)}
                helperText={formik.touched.fullName && formik.errors.fullName}
                sx={{ mb: 2 }}
                InputProps={{ startAdornment: <InputAdornment position="start"><Person fontSize="small" color="action" /></InputAdornment> }}
            />
            <TextField
                fullWidth label="Email" name="email" type="email"
                value={formik.values.email} onChange={formik.handleChange} onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                sx={{ mb: 2 }}
                InputProps={{ startAdornment: <InputAdornment position="start"><Email fontSize="small" color="action" /></InputAdornment> }}
            />
            <TextField
                fullWidth label="Password" name="password" type={showPassword ? 'text' : 'password'}
                value={formik.values.password} onChange={formik.handleChange} onBlur={formik.handleBlur}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
                sx={{ mb: 2 }}
                InputProps={{
                    startAdornment: <InputAdornment position="start"><Lock fontSize="small" color="action" /></InputAdornment>,
                    endAdornment: <InputAdornment position="end"><IconButton size="small" onClick={() => setShowPassword(v => !v)}>{showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}</IconButton></InputAdornment>
                }}
            />
            <TextField
                fullWidth label="Confirm Password" name="confirmPassword" type={showPassword ? 'text' : 'password'}
                value={formik.values.confirmPassword} onChange={formik.handleChange} onBlur={formik.handleBlur}
                error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                sx={{ mb: 3 }}
                InputProps={{ startAdornment: <InputAdornment position="start"><Lock fontSize="small" color="action" /></InputAdornment> }}
            />

            <Button
                fullWidth type="submit" variant="contained" size="large"
                disabled={isLoading} sx={{ mb: 2, py: 1.4, fontWeight: 700 }}
            >
                {isLoading ? <CircularProgress size={22} color="inherit" /> : 'Create Account'}
            </Button>

            <Typography variant="body2" align="center" color="text.secondary">
                Already have an account?{' '}
                <Link component={RouterLink} to="/login" fontWeight={600}>Sign in</Link>
            </Typography>
        </Box>
    )
}
