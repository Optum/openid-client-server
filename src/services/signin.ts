import {FastifyReply, FastifyRequest} from 'fastify'
import crs from 'crypto-random-string'
import {ClientService, Options} from '../types'

export default function make(service: ClientService, {scope}: Options) {
    return async function (
        request: FastifyRequest,
        reply: FastifyReply
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

        const fromUrl = request.headers.referer || '/'
        let fromProtected = await request.session.get('fromProtected')

        if (typeof fromProtected === 'string') {
            fromProtected = fromProtected === 'true'
        }

        await request.session.set('csrfString', state)

        await (fromProtected
            ? request.session.set('fromProtected', false)
            : request.session.set('fromUrl', fromUrl))

        if (code_verifier) {
            await request.session.set('codeVerifier', code_verifier)
        }

        return reply.redirect(authUrl)
    }
}
