import {Client, generators} from 'openid-client'
import {DefaultErrorResponse, qsOfErrorResponse} from '../status'
import {pathFromReferer, pathsMatch, redirectResponse} from './util'

import {Context} from '../context'
import {OpenIdClientMiddleware} from './types'
import {Options} from '../options'
import {SessionStore} from '../session'
import crs from 'crypto-random-string'

export const signInMiddleware = (
    client: Client,
    pathname: string,
    options: Options,
    sessionStore: SessionStore
): OpenIdClientMiddleware => {
    return async (ctx: Context): Promise<Context> => {
        const {errorPagePath, enablePKCE} = options.clientServerOptions
        try {
            if (pathsMatch(ctx.url, pathname)) {
                if (!ctx.sessionId) {
                    throw new Error('invalid session')
                }

                const state = crs({length: 16})
                let authUrl
                let codeVerifier: string | null = null

                if (enablePKCE) {
                    ctx.log.debug('building authUrl with code_verifier')
                    codeVerifier = generators.codeVerifier()

                    ctx.log.debug(
                        `codeVerifier value when building auth url ${codeVerifier}`
                    )

                    const code_challenge = generators.codeChallenge(
                        codeVerifier
                    )

                    authUrl = client.authorizationUrl({
                        state,
                        scope: options.clientServerOptions.scope,
                        code_challenge,
                        code_challenge_method: 'S256'
                    })
                } else {
                    authUrl = client.authorizationUrl({
                        state,
                        scope: options.clientServerOptions.scope
                    })
                }

                let fromUrl = '/'

                if (ctx.req.headers.referer) {
                    fromUrl = pathFromReferer(String(ctx.req.headers.referer))
                }

                await sessionStore.set(ctx.sessionId, {
                    codeVerifier,
                    csrfString: state,
                    fromUrl
                })

                ctx.done = true
                redirectResponse(authUrl, ctx.res)
                return ctx
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
