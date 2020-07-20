import {Client} from 'openid-client'
import {Context} from '../context'
import {Json} from '../json'
import {Options} from '../options'
import {SessionStore} from '../session'

export interface UserInfoFromJwtService {
    userInfoFromJwt: (token: string) => Promise<Json>
}

export type BooleanCheckMiddleware = (ctx: Context) => Promise<boolean>
export type OpenIdClientMiddleware = (ctx: Context) => Promise<Context>

export interface UserInfoParams {
    client: Client
    pathname: string
    sessionStore: SessionStore
    options: Options
    userInfoFromJwtService: UserInfoFromJwtService
}

export interface ProxyParams {
    host: string
    pathname: string
    excludeCookie: boolean
    useIdToken: boolean
    sessionStore: SessionStore
    client: Client
}

export interface ExecuteProxyRequestParams {
    token: string
    excludeCookie: boolean
    host: string
    pathname: string
    ctx: Context
    method: string
}
