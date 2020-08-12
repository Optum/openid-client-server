import {DefaultErrorResponse, qsOfErrorResponse} from '../status'
import {pathsMatch, redirectResponse} from './util'

import {Context} from '../context'
import {OpenIdClientMiddleware} from './types'
import {Options} from '../options'
import {SessionStore} from '../session'
import {clearCookies} from '../cookies'
import qs from 'qs'

export const signOutMiddleware = (
    pathname: string,
    options: Options,
    sessionStore: SessionStore
): OpenIdClientMiddleware => {
    return async (ctx: Context): Promise<Context> => {
        const {errorPagePath} = options.clientServerOptions
        try {
            if (pathsMatch(ctx.url, pathname)) {
                ctx.done = true

                const loggedOutPage =
                    options.clientServerOptions.signedOutPage ?? '/'

                let sessionState: string | undefined

                if (ctx.url.search) {
                    const {session_state} = qs.parse(ctx.url.search)
                    if (session_state) {
                        sessionState = session_state as string

                        ctx.log.debug(
                            `session state was parsed from ctx.url.search as ${String(
                                sessionState
                            )}`
                        )
                    }
                }

                if (sessionState) {
                    const session = await sessionStore.getByPair(
                        'sessionState',
                        sessionState
                    )

                    ctx.log.debug(`session = ${JSON.stringify(session)}`)

                    if (session) {
                        await sessionStore.destroy(session.sessionId)
                        redirectResponse(loggedOutPage, ctx.res)
                        return ctx
                    }

                    ctx.log.debug(
                        `signout process was unable to find a session via session state ${sessionState}`
                    )
                }

                if (!ctx.sessionId) {
                    ctx.log.debug(
                        `signout process was unable to find a session. redirecting to logged out page ${loggedOutPage}`
                    )
                    redirectResponse(loggedOutPage, ctx.res)
                    return ctx
                }

                ctx.log.debug(
                    `signout destroying session ${ctx.sessionId}. redirecting to logged out page ${loggedOutPage}`
                )
                await sessionStore.destroy(ctx.sessionId)
                clearCookies(ctx.req, ctx.res, options.sessionOptions)
                redirectResponse(loggedOutPage, ctx.res)
                return ctx
            }
        } catch (error) {
            ctx.log.error(error)
            redirectResponse(
                `${errorPagePath}?${qsOfErrorResponse(DefaultErrorResponse)}`,
                ctx.res
            )
            return ctx
        }

        return ctx
    }
}
