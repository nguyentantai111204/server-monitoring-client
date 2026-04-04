import type accountReducer from './account/account.slice'
import type { store } from './store.redux'
import type systemReducer from './system/system.slice'

export type RootState = {
    account: ReturnType<typeof accountReducer>
    system: ReturnType<typeof systemReducer>
}

export type AppDispatch = typeof store.dispatch
