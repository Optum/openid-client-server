import {DefaultErrorResponse, qsOfErrorResponse} from '../status'

import type {Context} from '../context'
import type {Options} from '../options'
import type {SessionStore} from '../session'
import {ensureCookies} from '../cookies'
import type {OpenIdClientMiddleware} from './types'
import {pathsMatch, redirectResponse} from './util'

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
