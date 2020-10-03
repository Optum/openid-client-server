import {FastifyInstance, HookHandlerDoneFunction} from 'fastify'
import fp from 'fastify-plugin'
import sensible from 'fastify-sensible'
import proxy from 'fastify-http-proxy'
import Ajv from 'ajv'
import {OCSOptions} from './types'
import {OpenIdClientService} from './service'
import session from './plugins/session'
import register from './services'
import options_schema from './options-schema.json'

function openIdClientServer(
    fastify: FastifyInstance,
    options: OCSOptions,
    done: HookHandlerDoneFunction
): void {
    const validate = new Ajv({allErrors: true}).compile(options_schema)
    const isValid = validate(options)

    if (
        !isValid &&
        Array.isArray(validate.errors) &&
        validate.errors.length !== 0
    ) {
        throw validate.errors
    }

    const service = new OpenIdClientService(fastify, options)
    service
        .init()
        .then(({contentHandler}) => {
            fastify.register(sensible)
            fastify.register(session, options)

            if (options.dev) {
                fastify.get('/_next/*', async (request, reply) => {
                    return contentHandler(request.raw, reply.raw).then(() => {
                        reply.sent = true
                    })
                })
            }

            // register all openid services
            register(fastify, options, service)

            // register proxy options if they were provided
            if (options.proxyOptions) {
                options.proxyOptions.forEach(proxyOptions => {
                    fastify.register(
                        proxy,
                        Object.assign(proxyOptions, {
                            preHandler: service.addInAuthorizationHeader(
                                proxyOptions
                            )
                        })
                    )
                })
            }

            // let the contentHandler handle everything else
            fastify.all('/*', async function (request, reply): Promise<void> {
                return contentHandler(request.raw, reply.raw).then(() => {
                    reply.sent = true
                })
            })

            done()
        })
        .catch(error => done(error))
}

export default fp(openIdClientServer, {
    fastify: '>=3.0.0',
    name: 'fastify-openid-client-server'
})
