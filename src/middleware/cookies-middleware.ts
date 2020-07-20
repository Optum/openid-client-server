import {DefaultErrorResponse, qsOfErrorResponse} from '../status'
import {pathsMatch, redirectResponse} from './util'

import {Context} from '../context'
import {OpenIdClientMiddleware} from './types'
import {Options} from '../options'
import {SessionStore} from '../session'
import {ensureCookies} from '../cookies'

export const cookiesMiddleware = (
    options: Options,
    sessionStore: SessionStore
): OpenIdClientMiddleware => {
    return async (ctx: Context): Promise<Context> => {
        const {sessionOptions, clientServerOptions} = options
        const {callbackPath} = clientServerOptions
        const {errorPagePath} = options.clientServerOptions
        try {
            if (!pathsMatch(ctx.url, callbackPath)) {
                ctx.sessionId = ensureCookies(ctx.req, ctx.res, sessionOptions)

                await sessionStore.set(ctx.sessionId, {
                    sessionId: ctx.sessionId
                })
            }
        } catch (error) {
            ctx.done = true
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
