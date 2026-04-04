import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../store.interface'

const selectAccountState = (state: RootState) => state.account

export const selectCurrentUser = createSelector(selectAccountState, (s) => s.user)
export const selectIsAuthenticated = createSelector(selectAccountState, (s) => s.isAuthenticated)
export const selectAccountLoading = createSelector(selectAccountState, (s) => s.isLoading)
export const selectAccountError = createSelector(selectAccountState, (s) => s.error)
