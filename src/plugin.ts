import {FastifyInstance} from 'fastify'
import secureSession from 'fastify-secure-session'
import proxy from 'fastify-http-proxy'
import {OpenIdClientService} from './service'
import services from './services'
import {AppType, Options} from './types'
import {validate as validateOptions} from './options'
import {isSecuredFactory, toRegexPaths} from './is-secured'
import {hasOneOrMore} from './util'

export default async function plugin(
    fastify: FastifyInstance,
    options: Options
): Promise<void> {
    validateOptions(options)

    const {appType, securedPaths, sessionOptions} = options

    const service = new OpenIdClientService(fastify, options)
    options.service = service

    const {contentHandler} = await service.init()

    fastify.register(secureSession, sessionOptions)

    if (
        securedPaths &&
        securedPaths.securedPaths &&
        hasOneOrMore(securedPaths.securedPaths)
    ) {
        const isSecured = isSecuredFactory(
            toRegexPaths(securedPaths.securedPaths),
            appType
        )
        fastify.addHook('onRequest', async (request, reply) => {
            const {url} = request.raw
            const tokenSet = await request.session.get('tokenSet')
            if (!tokenSet && url && isSecured(url)) {
                request.session.set('fromUrl', url)
                request.session.set('fromProtected', true)
                reply.redirect('/openid/signin')
                reply.sent = true
            }
        })
    }

    if (options.dev && options.appType === AppType.NEXTJS) {
        fastify.get('/_next/*', contentHandler)
    }

    fastify.register(services, options)

    // register proxy options if they were provided
    if (options.proxyOptions) {
        options.proxyOptions.forEach(proxyOptions => {
            fastify.register(
                proxy,
                Object.assign(proxyOptions, {
                    preHandler: service.addInAuthorizationHeader(proxyOptions)
                })
            )
        })
    }

    // let the contentHandler handle everything else
    fastify.all('/*', contentHandler)
}
