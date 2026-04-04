import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { SystemState, SnackbarSeverity } from './system.interface'

const initialState: SystemState = {
    snackbar: {
        open: false,
        message: '',
        severity: 'info',
    },
}

export const systemSlice = createSlice({
    name: 'system',
    initialState,
    reducers: {
        showSnackbar: (state, action: PayloadAction<{ message: string; severity?: SnackbarSeverity }>) => {
            state.snackbar.open = true
            state.snackbar.message = action.payload.message
            state.snackbar.severity = action.payload.severity ?? 'info'
        },
        hideSnackbar: (state) => {
            state.snackbar.open = false
        },
    },
})

export const { showSnackbar, hideSnackbar } = systemSlice.actions
export default systemSlice.reducer
