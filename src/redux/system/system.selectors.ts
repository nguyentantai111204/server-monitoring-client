import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../store.interface'

const selectSystemState = (state: RootState) => state.system

export const selectSnackbar = createSelector(selectSystemState, (s) => s.snackbar)
