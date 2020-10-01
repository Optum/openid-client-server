import {FastifyInstance} from 'fastify'
import {OCSOptions} from '../types'
import {OpenIdClientService} from '../service'

export function callback(
    fastify: FastifyInstance,
    _: OCSOptions,
    service: OpenIdClientService
): void {
    fastify.get('/openid/callback', async function (
        request,
        reply
    ): Promise<void> {
        const csrfString = (await request.session.get('csrfString')) as string
        const codeVerifier = (await request.session.get(
            'codeVerifier'
        )) as string

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

        const fromUrl = (await request.session.get('fromUrl')) as string

        return reply.redirect(fromUrl ?? '/')
    })
}

export default callback
