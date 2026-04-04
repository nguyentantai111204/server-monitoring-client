import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../redux/store.redux'
import { getProfile } from '../../redux/account/account.action'
import { selectIsAuthenticated } from '../../redux/account/account.selectors'


export const AuthInitializer = () => {
    const dispatch = useAppDispatch()
    const isAuthenticated = useAppSelector(selectIsAuthenticated)

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(getProfile())
        }
    }, [])

    return null
}
