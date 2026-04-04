import { Alert, Snackbar } from '@mui/material'
import { useAppDispatch, useAppSelector } from '../../redux/store.redux'
import { selectSnackbar } from '../../redux/system/system.selectors'
import { hideSnackbar } from '../../redux/system/system.slice'

export const GlobalSnackbar = () => {
    const dispatch = useAppDispatch()
    const { open, message, severity } = useAppSelector(selectSnackbar)

    return (
        <Snackbar
            open={open}
            autoHideDuration={4000}
            onClose={() => dispatch(hideSnackbar())}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
            <Alert
                severity={severity}
                variant="filled"
                onClose={() => dispatch(hideSnackbar())}
                sx={{ minWidth: 280 }}
            >
                {message}
            </Alert>
        </Snackbar>
    )
}
