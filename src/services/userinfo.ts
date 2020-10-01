import {FastifyInstance} from 'fastify'
import {OCSOptions} from '../types'
import {OpenIdClientService} from '../service'
import {TokenSet} from 'openid-client'

export function userinfo(
    fastify: FastifyInstance,
    _: OCSOptions,
    service: OpenIdClientService
): void {
    fastify.get('/openid/userinfo', async function (
        request,
        reply
    ): Promise<void> {
        let tokenSet: TokenSet = (await request.session.get(
            'tokenSet'
        )) as TokenSet

        if (!tokenSet) {
            return reply.unauthorized()
        }

        if (tokenSet.expired()) {
            if (!tokenSet.refresh_token) {
                return reply.unauthorized()
            }

            tokenSet = await service.client.refresh(tokenSet)

            await request.session.set('tokenSet', tokenSet)

            const userinfo = await service.client.userinfo(tokenSet)
            return reply.status(200).send(userinfo)
        }

        const userinfo = await service.client.userinfo(tokenSet)
        return reply.status(200).send(userinfo)
    })
}

export default userinfo
