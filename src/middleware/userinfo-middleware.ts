import {AccessDeniedErrorResponse} from '../status'
import type {Context} from '../context'
import type {OpenIdClientMiddleware, UserInfoParams} from './types'
import {pathsMatch, sendJsonResponse} from './util'

export const userInfoMiddleware = (
    userInfoParameters: UserInfoParams
): OpenIdClientMiddleware => {
    const {status_code: accessDeniedStatusCode} = AccessDeniedErrorResponse
    return async (ctx: Context): Promise<Context> => {
        const {
            client,
            pathname,
            sessionStore,
            options,
            userInfoFromJwtService: {userInfoFromJwt}
        } = userInfoParameters
        try {
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

                        await sessionStore.set(ctx.sessionId, {
                            tokenSet,
                            // clear cached userinfo on token refresh
                            userInfo: null
                        })
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

                if (session.userInfo) {
                    ctx.log.trace(
                        'userinfo returning via userInfo object in session'
                    )
                    sendJsonResponse(200, session.userInfo, ctx.res)
                    ctx.done = true
                    return ctx
                }

                if (options.clientServerOptions.enableOauth2) {
                    const userInfo = await client.userinfo(
                        String(session.tokenSet.access_token)
                    )

                    await sessionStore.set(ctx.sessionId, {userInfo})

                    sendJsonResponse(200, userInfo, ctx.res)
                    ctx.done = true
                    return ctx
                }

                if (
                    options.clientServerOptions.scope &&
                    !options.clientServerOptions.scope.includes('openid') &&
                    !options.clientServerOptions.enableOauth2
                ) {
                    ctx.log.trace(
                        'userinfo returning via access_token object in oauthMode'
                    )
                    const userInfo = await userInfoFromJwt(
                        String(session.tokenSet.access_token)
                    )

                    await sessionStore.set(ctx.sessionId, {userInfo})

                    sendJsonResponse(200, userInfo, ctx.res)
                    ctx.done = true
                    return ctx
                }

                ctx.log.trace(
                    'merging userinfo from access_token and returning via id_token client.userinfo'
                )
                const userInfo = await client.userinfo(
                    String(session.tokenSet.access_token)
                )

                const additionalInfo = await userInfoFromJwt(
                    String(session.tokenSet.id_token)
                )

                const mergedUserInfo = Object.assign(userInfo, additionalInfo)

                await sessionStore.set(ctx.sessionId, {
                    userInfo: mergedUserInfo
                })

                sendJsonResponse(200, mergedUserInfo, ctx.res)
            }

            return ctx
        } catch (error) {
            ctx.done = true
            ctx.log.error('error retrieving userinfo', error)
            sendJsonResponse(
                accessDeniedStatusCode,
                AccessDeniedErrorResponse,
                ctx.res
            )
            return ctx
        }
    }
}
