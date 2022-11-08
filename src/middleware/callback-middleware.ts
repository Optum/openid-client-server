import type {Client} from 'openid-client'
import qs from 'qs'
import {DefaultErrorResponse, qsOfErrorResponse} from '../status'
import type {Context} from '../context'
import type {Options} from '../options'
import {pathsMatch, redirectResponse, showResponse} from './util'

import type {OpenIdClientMiddleware} from './types'

const getRedirectPage = (
    processPathName: string,
    redirectQsParameters: string
): string => {
    return `
    <html>
        <head>
        </head>
        <body>
            verifying...
            <script>
                window.addEventListener("load", () => {
                    window.location.href = '${processPathName}?${redirectQsParameters}'
                })
            </script>
        </body>
    </html>
`
}

export const callbackMiddleware = (
    client: Client,
    pathname: string,
    processPathName: string,
    options: Options
): OpenIdClientMiddleware => {
    return async (ctx: Context): Promise<Context> => {
        const {errorPagePath} = options.clientServerOptions
        try {
            if (pathsMatch(ctx.url, pathname)) {
                const callbackParameters = client.callbackParams(ctx.req)

                const redirectQsParameters = qs.stringify(callbackParameters)

                showResponse(
                    200,
                    getRedirectPage(processPathName, redirectQsParameters),
                    ctx.res
                )

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
