import {FastifyInstance, HookHandlerDoneFunction} from 'fastify'
import fp from 'fastify-plugin'
import {
    ISession,
    ISessionStore,
    OCSOptions,
    SessionObject,
    ValueOf
} from '../types'
import LRU from 'lru-cache'
import {ensureCookies} from '../cookies'

export class Session implements ISession {
    sessionId: string
    store: LRU<keyof SessionObject, ValueOf<SessionObject>>

    constructor(sessionId: string) {
        this.sessionId = sessionId
        this.store = new LRU<keyof SessionObject, ValueOf<SessionObject>>()
    }

    async destroy(): Promise<void> {
        this.store.reset()
    }

    async get(
        key: keyof SessionObject
    ): Promise<ValueOf<SessionObject> | undefined> {
        return this.store.get(key)
    }

    async set(
        key: keyof SessionObject,
        value: ValueOf<SessionObject>
    ): Promise<void> {
        this.store.set(key, value)
    }
}

export class MemorySessionStore implements ISessionStore {
    store: LRU<string, ISession>

    constructor() {
        this.store = new LRU<string, ISession>()
    }

    get(key: string): ISession | Promise<ISession | undefined> | undefined {
        return this.store.get(key)
    }
    set(key: string, value: ISession): void | Promise<void> {
        this.store.set(key, value)
    }
}

function openIdClientSession(
    fastify: FastifyInstance,
    options: OCSOptions,
    done: HookHandlerDoneFunction
): void {
    const sessionStore: ISessionStore =
        options.sessionStore ?? new MemorySessionStore()

    fastify.decorateRequest('session', {})
    fastify.addHook('onRequest', async function (
        request,
        reply
    ): Promise<void> {
        const sessionId = ensureCookies(
            request.raw,
            reply.raw,
            options.sessionOptions
        )

        let session = await sessionStore.get(sessionId)

        if (!session) {
            request.log.debug(
                `No session found for sessionId: ${sessionId}. Creating empty session`
            )

            if (typeof options.sessionFactory?.createSession === 'undefined') {
                session = new Session(sessionId)
            } else {
                session = await options.sessionFactory.createSession(sessionId)
            }
        }

        await sessionStore.set(sessionId, session)

        Object.assign(request, {
            session
        })

        return
    })

    done()
}

export default fp(openIdClientSession, {
    fastify: '>=3.0.0',
    name: 'fastify-openid-client-server-session'
})
