import type {TokenSet, UserinfoResponse} from 'openid-client'

import type {Json} from './json'

export type Profile = Record<string, any>

export type SessionMemCache = Record<string, unknown | any> &
    Map<string, Session>

export type Session = {
    sessionId: string
    createdAt: number
    csrfString: string | undefined
    codeVerifier: string | undefined
    tokenSet: TokenSet | undefined
    userInfo: UserinfoResponse | undefined
    sessionState: string | undefined
    fromUrl: string | undefined
    securedPathFromUrl: string | undefined
} & Json

export type SessionStore = {
    clear(): Promise<void>
    destroy(sessionId: string): Promise<void>
    get(sessionId: string): Promise<Session | undefined>
    getByPair(key: string, value: string): Promise<Session | undefined>
    set(sessionId: string, sessionPatch: Json): Promise<void>
}

export class MemorySessionStore implements SessionStore {
    cache: SessionMemCache

    constructor() {
        this.cache = new Map<string, Session>()
    }

    async clear(): Promise<void> {
        this.cache.clear()
    }

    async destroy(sessionId: string): Promise<void> {
        this.cache.delete(sessionId)
    }

    async getByPair(key: string, value: string): Promise<Session | undefined> {
        for (const entry of this.cache.entries()) {
            const session = entry[1]
            if (session[key] === value) {
                return session
            }
        }
    }

    async get(sessionId: string): Promise<Session | undefined> {
        return this.cache.get(sessionId)
    }

    async set(sessionId: string, sessionPatch: Json): Promise<void> {
        let session = await this.get(sessionId)

        if (!session) {
            session = {
                sessionId,
                createdAt: Date.now(),
                csrfString: null,
                codeVerifier: null,
                tokenSet: null,
                userInfo: null,
                sessionState: null,
                fromUrl: null,
                securedPathFromUrl: null
            }
        }

        session = Object.assign(session, sessionPatch)

        this.cache.set(sessionId, session)
    }
}
