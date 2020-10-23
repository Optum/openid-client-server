import {FastifyInstance, HookHandlerDoneFunction} from 'fastify'
import {OpenIdRoutes, Options} from '../types'
import makeErrorHandler from './error'
import makeSigninHandler from './signin'
import makeSignoutHandler from './signout'
import makeUserinfoHandler from './userinfo'
import makeCallbackHandler from './callback'

const optionRouteOrDefault = (
    openidRoutes: OpenIdRoutes | undefined,
    optionKey: keyof OpenIdRoutes,
    defaultRoute: string
): string => {
    if (openidRoutes) {
        const customRoute = openidRoutes[optionKey]

        if (!customRoute) {
            return defaultRoute
        }

        return customRoute
    }

    return defaultRoute
}

export default function register(
    fastify: FastifyInstance,
    options: Options,
    done: HookHandlerDoneFunction
): void {
    const {openidRoutes, service} = options

    const defaultRouteOptions = {schema: {}}

    fastify.get(
        optionRouteOrDefault(openidRoutes, 'error', '/openid/error'),
        defaultRouteOptions,
        makeErrorHandler()
    )
    fastify.get(
        optionRouteOrDefault(openidRoutes, 'signin', '/openid/signin'),
        defaultRouteOptions,
        makeSigninHandler(service, options)
    )
    fastify.get(
        optionRouteOrDefault(openidRoutes, 'signout', '/openid/signout'),
        defaultRouteOptions,
        makeSignoutHandler(options)
    )
    fastify.get(
        optionRouteOrDefault(openidRoutes, 'userinfo', '/openid/userinfo'),
        defaultRouteOptions,
        makeUserinfoHandler(service)
    )
    fastify.get(
        optionRouteOrDefault(openidRoutes, 'callback', '/openid/callback'),
        defaultRouteOptions,
        makeCallbackHandler(service)
    )

    done()
}
