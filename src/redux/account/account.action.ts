import { createAction, createAsyncThunk } from '@reduxjs/toolkit'
import type { LoginRequest, LoginResponse, RegisterRequest, RefreshTokenResponse } from '../../apis/auth/auth.interface'
import type { UserProfile } from '../../apis/users/users.interface'
import { getProfileApi, loginApi, logoutApi, refreshTokenApi, registerApi } from '@/apis/auth/auth.api'

export const logout = createAsyncThunk('account/logout', async (_, { rejectWithValue }) => {
    try {
        await logoutApi()
        return true
    } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } }; message?: string }
        return rejectWithValue(err.response?.data?.message || err.message || 'Logout failed')
    }
})

export const login = createAsyncThunk<LoginResponse, LoginRequest>(
    'account/login',
    async (credentials, { rejectWithValue }) => {
        try {
            return await loginApi(credentials)
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string }
            return rejectWithValue(err.response?.data?.message || err.message || 'Login failed')
        }
    }
)

export const signup = createAsyncThunk<void, RegisterRequest>(
    'account/signup',
    async (data, { rejectWithValue }) => {
        try {
            await registerApi(data)
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string }
            return rejectWithValue(err.response?.data?.message || err.message || 'Register failed')
        }
    }
)

export const getProfile = createAsyncThunk<UserProfile>(
    'account/getProfile',
    async (_, { rejectWithValue }) => {
        try {
            return await getProfileApi()
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string }
            return rejectWithValue(err.response?.data?.message || err.message || 'Get profile failed')
        }
    }
)

export const refreshToken = createAsyncThunk<RefreshTokenResponse>(
    'account/refreshToken',
    async (_, { rejectWithValue }) => {
        try {
            return await refreshTokenApi()
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string }
            return rejectWithValue(err.response?.data?.message || err.message || 'Refresh token failed')
        }
    }
)

export const updateProfileLocal = createAction<Partial<UserProfile>>('account/updateProfileLocal')
