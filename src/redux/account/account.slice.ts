import { createSlice } from '@reduxjs/toolkit'
import type { AccountState } from './account.interface'
import { login, logout, getProfile, signup, refreshToken, updateProfileLocal } from './account.action'

const initialState: AccountState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
}

const extractError = (payload: unknown): string => {
    if (typeof payload === 'string') return payload
    if (typeof payload === 'object' && payload !== null && 'message' in payload) {
        return (payload as { message: string }).message
    }
    return 'Something went wrong'
}

export const accountSlice = createSlice({
    name: 'account',
    initialState,
    reducers: {
        clearAccountError: (state) => {
            state.error = null
        },
    },
    extraReducers: (builder) => {
        builder
            // ─── Logout ─────────────────────────────────────
            .addCase(logout.fulfilled, (state) => {
                state.user = null
                state.isAuthenticated = false
                state.isLoading = false
                state.error = null
            })

            // ─── Login ──────────────────────────────────────
            .addCase(login.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false
                state.isAuthenticated = true
                state.user = action.payload.user
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false
                state.isAuthenticated = false
                state.user = null
                state.error = extractError(action.payload)
            })

            // ─── Register ───────────────────────────────────
            .addCase(signup.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(signup.fulfilled, (state) => {
                state.isLoading = false
            })
            .addCase(signup.rejected, (state, action) => {
                state.isLoading = false
                state.error = extractError(action.payload)
            })

            // ─── Get Profile ─────────────────────────────────
            .addCase(getProfile.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(getProfile.fulfilled, (state, action) => {
                state.isLoading = false
                state.user = action.payload
            })
            .addCase(getProfile.rejected, (state, action) => {
                state.isLoading = false
                state.isAuthenticated = false
                state.user = null
                state.error = extractError(action.payload)
            })

            // ─── Refresh Token ───────────────────────────────
            .addCase(refreshToken.fulfilled, () => {
                // cookies are updated by the server
            })
            .addCase(refreshToken.rejected, (state, action) => {
                state.error = extractError(action.payload)
            })

            // ─── Update Profile (local) ──────────────────────
            .addCase(updateProfileLocal, (state, action) => {
                if (state.user) {
                    state.user = { ...state.user, ...action.payload }
                }
            })
    },
})

export const { clearAccountError } = accountSlice.actions
export default accountSlice.reducer
