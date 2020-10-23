import fastify, {FastifyInstance, FastifyServerOptions} from 'fastify'
import fp from 'fastify-plugin'
import plugin from './plugin'
import {Options} from './types'

export {AppType, OpenIdRoutes, ProxyOptions, Options} from './types'

export const ocsPlugin = fp(plugin, '3.x')

export const createOCSServer = (
    fastifyOptions: FastifyServerOptions,
    ocsOptions: Options
): FastifyInstance => fastify(fastifyOptions).register(ocsPlugin, ocsOptions)
