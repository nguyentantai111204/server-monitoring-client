import { useState } from 'react'
import {
    Box, TextField, Button, Typography, Link, Alert, CircularProgress, InputAdornment, IconButton
} from '@mui/material'
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../redux/store.redux'
import { login } from '../../redux/account/account.action'
import { selectAccountError, selectAccountLoading } from '../../redux/account/account.selectors'

const validationSchema = Yup.object({
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().min(6, 'At least 6 characters').required('Password is required'),
})

export const LoginPage = () => {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const isLoading = useAppSelector(selectAccountLoading)
    const error = useAppSelector(selectAccountError)
    const [showPassword, setShowPassword] = useState(false)

    const formik = useFormik({
        initialValues: { email: '', password: '' },
        validationSchema,
        onSubmit: async (values) => {
            const result = await dispatch(login(values))
            if (login.fulfilled.match(result)) {
                navigate('/')
            }
        },
    })

    return (
        <Box component="form" onSubmit={formik.handleSubmit}>
            <Typography variant="h5" fontWeight={700} mb={0.5}>
                Sign In
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
                Monitor your servers in real time
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                sx={{ mb: 2 }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Email fontSize="small" color="action" />
                        </InputAdornment>
                    ),
                }}
            />

            <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
                sx={{ mb: 3 }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Lock fontSize="small" color="action" />
                        </InputAdornment>
                    ),
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton size="small" onClick={() => setShowPassword((v) => !v)}>
                                {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />

            <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{ mb: 2, py: 1.4, fontWeight: 700 }}
            >
                {isLoading ? <CircularProgress size={22} color="inherit" /> : 'Sign In'}
            </Button>

            <Typography variant="body2" align="center" color="text.secondary">
                Don't have an account?{' '}
                <Link component={RouterLink} to="/register" fontWeight={600}>
                    Sign up
                </Link>
            </Typography>
        </Box>
    )
}
