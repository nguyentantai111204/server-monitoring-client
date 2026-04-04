export type SnackbarSeverity = 'success' | 'error' | 'warning' | 'info'

export interface SystemState {
    snackbar: {
        open: boolean
        message: string
        severity: SnackbarSeverity
    }
}
