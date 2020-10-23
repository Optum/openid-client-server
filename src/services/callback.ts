import {FastifyReply, FastifyRequest} from 'fastify'
import {ClientService} from '../types'

export default function make(service: ClientService) {
    return async function handler(
        request: FastifyRequest,
        reply: FastifyReply
    ): Promise<void> {
        const csrfString = request.session.get('csrfString')
        const codeVerifier = request.session.get('codeVerifier')

        if (!csrfString) {
            request.log.error(
                'OpenId Client Server Error: Unable to find csrfString in session.'
            )
            return reply.redirect('/openid/error')
        }

        const tokenSet = await service.getTokenSet(
            csrfString,
            codeVerifier,
            request
        )

        request.session.set('tokenSet', tokenSet)

        const fromUrl = await request.session.get('fromUrl')

        return reply.redirect(fromUrl ?? '/')
    }
}
