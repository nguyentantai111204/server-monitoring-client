import { logout } from '@/redux/account/account.action'
import { store } from '@/redux/store.redux'
import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'


const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
    timeout: 30000,
})

interface RetryQueueItem {
    resolve: (value?: unknown) => void
    reject: (error?: unknown) => void
}

let isRefreshing = false
let refreshQueue: RetryQueueItem[] = []

const processQueue = (error: Error | null) => {
    refreshQueue.forEach((prom) => {
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve()
        }
    })
    refreshQueue = []
}

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

        const authEndpoints = ['/auth/login', '/auth/register', '/auth/refresh']
        const isAuthEndpoint = authEndpoints.some((ep) => originalRequest.url?.includes(ep))

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    refreshQueue.push({ resolve, reject })
                })
                    .then(() => axiosInstance(originalRequest))
                    .catch((err) => Promise.reject(err))
            }

            originalRequest._retry = true
            isRefreshing = true

            try {
                const { refreshTokenApi } = await import('@/apis/auth/auth.api')
                await refreshTokenApi()
                processQueue(null)
                isRefreshing = false
                return axiosInstance(originalRequest)
            } catch (refreshError) {
                processQueue(refreshError as Error)
                store.dispatch(logout())
                isRefreshing = false
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    }
)

export default axiosInstance
