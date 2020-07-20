import {DefaultErrorResponse, qsOfErrorResponse} from '../status'
import {pathsMatch, redirectResponse, showResponse} from './util'

import {Client} from 'openid-client'
import {Context} from '../context'
import {OpenIdClientMiddleware} from './types'
import {Options} from '../options'
import qs from 'qs'

const getRedirectPage = (
    processPathName: string,
    redirectQsParams: string
): string => {
    return `
    <html>
        <head>
        </head>
        <body>
            verifying...
            <script>
                window.addEventListener("load", () => {
                    window.location.href = '${processPathName}?${redirectQsParams}'
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
                const callbackParams = client.callbackParams(ctx.req)

                const redirectQsParams = qs.stringify(callbackParams)

                showResponse(
                    200,
                    getRedirectPage(processPathName, redirectQsParams),
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
