import {DefaultErrorResponse, qsOfErrorResponse} from '../status'
import {pathsMatch, redirectResponse} from './util'

import {Client} from 'openid-client'
import {Context} from '../context'
import {OpenIdClientMiddleware} from './types'
import {Options} from '../options'
import {SessionStore} from '../session'

export const processCallbackMiddleware = (
    client: Client,
    pathname: string,
    options: Options,
    sessionStore: SessionStore
): OpenIdClientMiddleware => {
    return async (ctx: Context): Promise<Context> => {
        const {errorPagePath} = options.clientServerOptions
        try {
            if (pathsMatch(ctx.url, pathname)) {
                if (!ctx.sessionId) {
                    throw new Error('invalid session')
                }

                const session = await sessionStore.get(ctx.sessionId)

                if (!session) {
                    throw new Error('invalid session')
                }

                const {csrfString, codeVerifier} = session

                if (!csrfString) {
                    throw new Error('invalid session')
                }

                if (codeVerifier) {
                    ctx.log.debug('processing callback with code_verifier')
                }

                // redirectUrl needs to be retrieved before clearing session props
                // to support memory stores
                // Consideration: look at using ramda for default memory store to avoid side effects
                const redirectUrl =
                    session.securedPathFromUrl ?? session.fromUrl ?? '/'

                const callbackParams = client.callbackParams(ctx.req)

                await sessionStore.set(ctx.sessionId, {
                    sessionState: callbackParams.session_state ?? null,
                    securedPathFromUrl: null,
                    fromUrl: null,
                    csrfString: null,
                    codeVerifier: null
                })

                const redirectUri = client.metadata.redirect_uris
                    ? client.metadata.redirect_uris[0]
                    : undefined

                if (
                    options.clientServerOptions.scope &&
                    !options.clientServerOptions.scope.includes('openid')
                ) {
                    ctx.tokenSet = await client.oauthCallback(
                        redirectUri,
                        callbackParams,
                        {
                            state: csrfString,
                            code_verifier: codeVerifier ?? undefined
                        }
                    )
                } else {
                    ctx.tokenSet = await client.callback(
                        redirectUri,
                        callbackParams,
                        {
                            state: csrfString,
                            code_verifier: codeVerifier ?? undefined
                        }
                    )
                }

                await sessionStore.set(ctx.sessionId, {tokenSet: ctx.tokenSet})

                redirectResponse(redirectUrl, ctx.res)
                ctx.done = true
                return ctx
            }
        } catch (error) {
            ctx.done = true
            ctx.log.error(error, ctx.url.href)
            redirectResponse(
                `${errorPagePath}?${qsOfErrorResponse(DefaultErrorResponse)}`,
                ctx.res
            )
            return ctx
        }

        return ctx
    }
}
