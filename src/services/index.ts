import {FastifyInstance} from 'fastify'
import {OCSOptions} from '../types'
import {OpenIdClientService} from '../service'

import {callback} from './callback'
import {error} from './error'
import {signin} from './signin'
import {signout} from './signout'
import {userinfo} from './userinfo'

export default function register(
    fastify: FastifyInstance,
    options: OCSOptions,
    service: OpenIdClientService
): void {
    callback(fastify, options, service)
    error(fastify)
    signin(fastify, options, service)
    signout(fastify, options)
    userinfo(fastify, options, service)
}
