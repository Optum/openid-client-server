import type {IncomingMessage, ServerResponse} from 'http'
import type {UrlWithParsedQuery} from 'url'
import {URL} from 'url'
import type {
    GetPublicKeyOrSecret,
    JwtHeader,
    Secret,
    SigningKeyCallback,
    VerifyCallback,
    VerifyErrors
} from 'jsonwebtoken'
import type {Headers} from 'node-fetch'
import fetch from 'node-fetch'

import type {UserinfoResponse} from 'openid-client'
import type jwksClient from 'jwks-rsa'
import type {Context} from '../context'
import type {ErrorResponse} from '../status'
import {DefaultErrorResponse} from '../status'
import type {Json} from '../json'
import type {Options} from '../options'
import type {
    ExecuteProxyRequestParams,
    OpenIdClientMiddleware,
    UserInfoFromJwtService
} from './types'

export const clone = (json: any): any => JSON.parse(JSON.stringify(json))
const {status_code: defaultErrorResponseStatusCode} = DefaultErrorResponse

export const redirectResponse = (
    location: string,
    res: ServerResponse
): void => {
    res.writeHead(302, {
        Location: location
    })

    res.end()
}

export const sendJsonResponse = (
    status: number,
    json: Json | UserinfoResponse | ErrorResponse,
    res: ServerResponse
): void => {
    const payload = JSON.stringify(json)
    sendResponse(
        status,
        {
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Length': Buffer.byteLength(payload)
        },
        payload,
        res
    )
}

export const sendResponse = (
    status: number,
    headers: any,
    payload: any,
    res: ServerResponse
): void => {
    if (headers.raw) {
        headers = clone(headers.raw())
    }

    res.writeHead(status, headers)
    res.end(payload)
}

export const showResponse = (
    status: number,
    payload: any,
    res: ServerResponse
): void => {
    res.statusCode = status
    res.end(payload)
}

export const pathsMatch = (
    url: UrlWithParsedQuery,
    pathname: string
): boolean => {
    if (url.pathname) {
        return url.pathname
            .toLowerCase()
            .startsWith(pathname.trim().toLowerCase())
    }

    return false
}

export const createUserInfoFromJwtService = (
    jwksClientInstance: jwksClient.JwksClient,
    jwtVerify: (
        token: string,
        secretOrPublicKey: Secret | GetPublicKeyOrSecret,
        callback?: VerifyCallback
    ) => void
): UserInfoFromJwtService => ({
    async userInfoFromJwt(token: string): Promise<Json> {
        return new Promise((resolve, reject) => {
            function getKey(
                header: JwtHeader,
                callback: SigningKeyCallback
            ): void {
                if (!header.kid || !header.alg) {
                    reject(new Error('invalid jwt header'))
                    return
                }

                jwksClientInstance.getSigningKey(
                    header.kid,
                    (error: Error | null, key: jwksClient.SigningKey): void => {
                        const _key = key
                        const signingKey =
                            _key.getPublicKey() ||
                            (_key as jwksClient.RsaSigningKey).rsaPublicKey
                        callback(error, signingKey)
                    }
                )
            }

            jwtVerify(
                token,
                getKey,
                // @ts-ignore
                (
                    error: VerifyErrors | null,
                    decoded: Record<string, unknown> | undefined
                ): void => {
                    if (error) {
                        reject(error)
                        return
                    }

                    resolve(decoded as Json)
                }
            )
        })
    }
})

export const parseBody = async (request: IncomingMessage): Promise<string> => {
    return new Promise(resolve => {
        let body = ''

        request.on('data', (chunk: string) => {
            body += chunk
        })

        request.on('end', () => {
            resolve(body)
        })
    })
}

export const withBreaker = (
    mw: OpenIdClientMiddleware,
    options: Options,
    name: string
): OpenIdClientMiddleware => {
    return async (ctx: Context): Promise<Context> => {
        if (ctx.url.pathname) {
            const {errorPagePath} = options.clientServerOptions

            if (pathsMatch(ctx.url, errorPagePath)) {
                ctx.log.trace(
                    `skipping ${name} with path ${ctx.url.pathname} on error page match`
                )
                return ctx
            }

            if (ctx.done) {
                ctx.log.trace(
                    `skipping ${name} with path ${
                        ctx.url.pathname
                    } on done ${String(ctx.done)}`
                )
                return ctx
            }

            ctx.log.trace(`invoking ${name} with path ${ctx.url.pathname}`)
            return mw(ctx)
        }

        return ctx
    }
}

export const pathFromReferer = (referer: string): string => {
    const refererUrl = new URL(referer)

    return `${refererUrl.pathname}${
        refererUrl.search ? `${refererUrl.search}` : ''
    }`
}

export const executeRequest = async (
    executeParameters: ExecuteProxyRequestParams
): Promise<void> => {
    const {
        token,
        excludeCookie,
        excludeOriginHeaders,
        host,
        pathname,
        ctx,
        method
    } = executeParameters
    const {headers} = ctx.req
    const {path} = ctx.url
    let body = ''
    const normalizedMethod = method.trim().toLowerCase()
    const includeBody =
        normalizedMethod === 'post' ||
        normalizedMethod === 'put' ||
        normalizedMethod === 'patch' ||
        normalizedMethod === 'delete'

    if (includeBody) {
        body = await parseBody(ctx.req)
    }

    let requestHeaders = clone(headers)

    if (excludeOriginHeaders) {
        requestHeaders = {}
    }

    requestHeaders.authorization = `Bearer ${token}`

    if (excludeCookie) {
        delete requestHeaders.cookie
    }

    const requestPath = String(path).replace(pathname, '')
    const requestUrl = new URL(`${host}${requestPath}`)
    requestHeaders.host = requestUrl.hostname

    ctx.log.debug(`fetching ${requestUrl.href}`)

    try {
        const response = await fetch(requestUrl.href, {
            method: normalizedMethod,
            headers: requestHeaders as Headers,
            body: includeBody ? body : undefined
        })

        sendResponse(
            response.status,
            response.headers,
            await response.text(),
            ctx.res
        )
    } catch (error) {
        ctx.log.error('Error sending proxy request', error)
        sendJsonResponse(
            defaultErrorResponseStatusCode,
            DefaultErrorResponse,
            ctx.res
        )
    }
}
