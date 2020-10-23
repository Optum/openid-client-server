import {FastifyReply, FastifyRequest} from 'fastify'
import {ClientService} from '../types'
import {TokenSet} from 'openid-client'
import http from 'http'

const ErrorResponses = {
    unauthorized: {
        statusCode: 401,
        message: http.STATUS_CODES[401]
    }
}

export default function make(service: ClientService) {
    return async function (
        request: FastifyRequest,
        reply: FastifyReply
    ): Promise<void> {
        const tokenSetJson = request.session.get('tokenSet')

        if (!tokenSetJson) {
            return reply.status(401).send(ErrorResponses.unauthorized)
        }

        let tokenSet = new TokenSet(tokenSetJson)

        if (tokenSet.expired()) {
            if (!tokenSet.refresh_token) {
                return reply.status(401).send(ErrorResponses.unauthorized)
            }

            tokenSet = await service.client.refresh(tokenSet)

            request.session.set('tokenSet', tokenSet)

            const userinfo = await service.client.userinfo(tokenSet)
            return reply.status(200).send(userinfo)
        }

        const userinfo = await service.client.userinfo(tokenSet)
        return reply.status(200).send({...userinfo, retrieved_at: Date.now()})
    }
}
