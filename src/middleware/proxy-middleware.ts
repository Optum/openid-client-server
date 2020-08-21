import {OpenIdClientMiddleware, ProxyParams} from './types'
import {executeRequest, pathsMatch, sendJsonResponse} from './util'

import {AccessDeniedErrorResponse} from '../status'
import {Context} from '../context'

export const proxyMiddleware = (
    proxyParams: ProxyParams
): OpenIdClientMiddleware => {
    const {
        host,
        pathname,
        excludeCookie,
        excludeOriginHeaders,
        useIdToken,
        sessionStore,
        client
    } = proxyParams
    const {status_code: accessDeniedStatusCode} = AccessDeniedErrorResponse
    return async (ctx: Context): Promise<Context> => {
        if (pathsMatch(ctx.url, pathname)) {
            if (!ctx.sessionId) {
                sendJsonResponse(
                    accessDeniedStatusCode,
                    AccessDeniedErrorResponse,
                    ctx.res
                )
                ctx.done = true
                return ctx
            }

            const session = await sessionStore.get(ctx.sessionId)

            if (!session || !session.tokenSet) {
                sendJsonResponse(
                    accessDeniedStatusCode,
                    AccessDeniedErrorResponse,
                    ctx.res
                )
                ctx.done = true
                return ctx
            }

            if (session.tokenSet.expired()) {
                ctx.log.debug('token is expired')

                if (session.tokenSet.refresh_token) {
                    const tokenSet = await client.refresh(session.tokenSet)

                    ctx.log.debug('refreshed token')

                    await sessionStore.set(ctx.sessionId, {tokenSet})
                    session.tokenSet = tokenSet
                } else {
                    sendJsonResponse(
                        accessDeniedStatusCode,
                        AccessDeniedErrorResponse,
                        ctx.res
                    )
                    ctx.done = true
                    return ctx
                }
            }

            let token = session.tokenSet.access_token

            if (useIdToken) {
                token = session.tokenSet.id_token
            }

            if (!token) {
                sendJsonResponse(
                    accessDeniedStatusCode,
                    AccessDeniedErrorResponse,
                    ctx.res
                )
                ctx.done = true
                return ctx
            }

            await executeRequest({
                token,
                excludeCookie,
                excludeOriginHeaders,
                host,
                pathname,
                ctx,
                method: String(ctx.req.method)
            })

            ctx.done = true
            return ctx
        }

        return ctx
    }
}
