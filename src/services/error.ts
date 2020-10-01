import {FastifyInstance} from 'fastify'

export function error(fastify: FastifyInstance): void {
    fastify.get('/openid/error', async function (
        _request,
        reply
    ): Promise<void> {
        return reply.status(200).send(fastify.httpErrors.internalServerError())
    })
}

export default error
