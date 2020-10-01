import {ISession} from '../types'

declare module 'fastify' {
    export interface FastifyRequest {
        session: ISession
    }
}
