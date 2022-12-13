import type {Client} from 'openid-client'
import {AccessDeniedErrorResponse, qsOfErrorResponse} from '../status'
import type {Context} from '../context'
import type {Options} from '../options'
import type {SessionStore} from '../session'
import type {BooleanCheckMiddleware} from './types'
import {redirectResponse} from './util'

export const securePathCheckMiddleware = (
    options: Options,
    sessionStore: SessionStore,
    client: Client
): BooleanCheckMiddleware => {
    return async (ctx: Context): Promise<boolean> => {
        const parsedUrl = ctx.url
        const {securedPaths, signInPath, errorPagePath} =
            options.clientServerOptions
        if (securedPaths) {
            if (!ctx.sessionId) {
                ctx.log.debug('secure path check detected no session id')
                redirectResponse(
                    `${errorPagePath}?${qsOfErrorResponse(
                        AccessDeniedErrorResponse
                    )}`,
                    ctx.res
                )
                return false
            }

            ctx.log.debug(
                `secure page check processing configured secured paths ${securedPaths.join(
                    ','
                )}`
            )
            const session = await sessionStore.get(ctx.sessionId)

            if (!session) {
                ctx.log.debug('secure path check detected no session in store')
                redirectResponse(signInPath, ctx.res)
                return false
            }

            if (session.tokenSet && !session.tokenSet.expired()) {
                ctx.log.debug(
                    'secure path check detected an existing valid session'
                )
                return true
            }

            if (session.tokenSet && session.tokenSet.expired()) {
                ctx.log.debug(
                    'secure path check detected an existing expired session'
                )

                if (session.tokenSet.refresh_token) {
                    ctx.tokenSet = await client.refresh(session.tokenSet)
                    await sessionStore.set(ctx.sessionId, {
                        tokenSet: ctx.tokenSet
                    })
                    ctx.log.debug('secure path refreshed token')
                    return true
                }
            }

            for (const securedPath of securedPaths) {
                // if unauthenticated request is accessing a secure path
                if (
                    String(parsedUrl.pathname)
                        .toLowerCase()
                        .startsWith(securedPath.toLowerCase())
                ) {
                    ctx.log.debug(
                        `Request to access secure path ${securedPath} detected. Redirecting to signin path`
                    )

                    // eslint-disable-next-line no-await-in-loop
                    await sessionStore.set(ctx.sessionId, {
                        securedPathFromUrl: `${String(parsedUrl.pathname)}${
                            parsedUrl.search && parsedUrl.search.trim() !== ''
                                ? parsedUrl.search
                                : ''
                        }`
                    })

                    redirectResponse(signInPath, ctx.res)

                    return false
                }
            }
        } else {
            ctx.log.trace(
                'secure paths no configured. skipping secure path check'
            )
        }

        return true
    }
}
