import {FastifyReply, FastifyRequest} from 'fastify'
import http from 'http'

const ErrorResponses = {
    internalServerError: {
        statusCode: 500,
        message: http.STATUS_CODES[500]
    }
}

const makeAwait = async (): Promise<void> => Promise.resolve()

export default function make() {
    return async function (
        _request: FastifyRequest,
        reply: FastifyReply
    ): Promise<void> {
        await makeAwait()
        return reply.status(200).send(ErrorResponses.internalServerError)
    }
}
