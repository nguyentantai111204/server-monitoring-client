export const HttpStatusSpecial = {
    REFRESH_TOKEN: 777,
    LOGOUT: 888,
} as const

export type HttpStatusSpecialType = typeof HttpStatusSpecial[keyof typeof HttpStatusSpecial]
