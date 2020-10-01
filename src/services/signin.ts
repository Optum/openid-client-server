import {FastifyInstance} from 'fastify'
import crs from 'crypto-random-string'
import {OCSOptions} from '../types'
import {OpenIdClientService} from '../service'

export function signin(
    fastify: FastifyInstance,
    options: OCSOptions,
    service: OpenIdClientService
): void {
    const {scope} = options

    fastify.get('/openid/signin', async function (
        request,
        reply
    ): Promise<void> {
        const state = crs({
            length: 32
        })
        const {
            code_verifier,
            ...restOfChallenge
        } = service.getChallengeArguments()

        const authUrl = service.client.authorizationUrl({
            state,
            scope,
            ...restOfChallenge
        })

        const fromUrl = request.headers.referer ?? '/'

        await request.session.set('csrfString', state)
        await request.session.set('fromUrl', fromUrl)

        if (code_verifier) {
            await request.session.set('codeVerifier', code_verifier)
        }

        return reply.redirect(authUrl)
    })
}

export default signin
