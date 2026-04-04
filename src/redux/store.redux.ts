import { combineReducers, configureStore } from '@reduxjs/toolkit'
import {  useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux'
import {
    FLUSH,
    PAUSE,
    PERSIST,
    persistReducer,
    persistStore,
    PURGE,
    REGISTER,
    REHYDRATE,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import accountReducer from './account/account.slice'
import systemReducer from './system/system.slice'
import type { AppDispatch, RootState } from './store.interface'

const accountPersistConfig = {
    key: 'account',
    storage,
    whitelist: ['user', 'isAuthenticated'],
    blacklist: ['error', 'isLoading'],
}

const rootReducer = combineReducers({
    account: persistReducer(accountPersistConfig, accountReducer),
    system: systemReducer,
})

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
})

export const persistor = persistStore(store)

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
