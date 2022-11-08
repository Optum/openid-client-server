import type {Client} from 'openid-client'
import type {Context} from '../context'
import type {Json} from '../json'
import type {Options} from '../options'
import type {SessionStore} from '../session'

export type UserInfoFromJwtService = {
    userInfoFromJwt: (token: string) => Promise<Json>
}

export type BooleanCheckMiddleware = (ctx: Context) => Promise<boolean>
export type OpenIdClientMiddleware = (ctx: Context) => Promise<Context>

export type UserInfoParams = {
    client: Client
    pathname: string
    sessionStore: SessionStore
    options: Options
    userInfoFromJwtService: UserInfoFromJwtService
}

export type ProxyParams = {
    host: string
    pathname: string
    excludeCookie: boolean
    excludeOriginHeaders: boolean
    useIdToken: boolean
    sessionStore: SessionStore
    client: Client
}

export type ExecuteProxyRequestParams = {
    token: string
    excludeCookie: boolean
    excludeOriginHeaders: boolean
    host: string
    pathname: string
    ctx: Context
    method: string
}
