import {FastifyReply, FastifyRequest} from 'fastify'
import {Session} from 'fastify-secure-session'
import {Options} from '../types'

export default function make({openidRoutes}: Options) {
    return async function (
        request: FastifyRequest<{
            Querystring: {session: Session; session_state: string}
        }>,
        reply: FastifyReply
    ): Promise<void> {
        const {session_state} = request.query

        if (session_state) {
            // TODO: implement look up session_state and destroy session
            return reply.status(200).send('OK')
        }

        await request.session.delete()

        return reply.redirect(
            openidRoutes && openidRoutes.signedOut
                ? openidRoutes.signedOut
                : '/'
        )
    }
}
