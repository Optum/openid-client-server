import {FastifyInstance} from 'fastify'
import {OCSOptions} from '../types'
// import {OCSService} from '../service'

export function signout(
    fastify: FastifyInstance,
    options: OCSOptions
    // service: OCSService
): void {
    fastify.get<{Querystring: {session_state?: string}}>(
        '/openid/signout',
        async function (request, reply): Promise<void> {
            const {session_state} = request.query

            if (session_state) {
                // TODO: implement look up session_state and destroy session
                return reply.status(200).send('OK')
            }

            await request.session.destroy()

            return reply.redirect(options.signedOutPage ?? '/')
        }
    )
}

export default signout
