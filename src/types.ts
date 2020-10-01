import {IncomingMessage, ServerResponse} from 'http'
import {ClientMetadata, TokenSet, UserinfoResponse} from 'openid-client'
import {FastifyHttpProxyOptions} from 'fastify-http-proxy'
import {UrlWithParsedQuery} from 'url'

export type ContentHandler = (
    request: IncomingMessage,
    res: ServerResponse,
    parsedUrl?: UrlWithParsedQuery | undefined
) => Promise<void>

export enum AppType {
    STATIC = 0,
    NEXTJS
}

export type ChallengeArguments = {
    code_challenge: string
    code_challenge_method: string
    code_verifier: string
}

export type ValueOf<T> = T[keyof T]

export type SessionObject = {
    sessionId: string
    createdAt: number
    lastAccessedAt: number
    csrfString: string
    codeVerifier: string
    tokenSet: TokenSet
    userInfo: UserinfoResponse
    sessionState: string
    fromUrl: string
}

export interface ISession {
    sessionId: string
    destroy(): Promise<void>
    get(key: keyof SessionObject): Promise<ValueOf<SessionObject> | undefined>
    set(key: keyof SessionObject, value: ValueOf<SessionObject>): Promise<void>
}

export interface ISessionFactory {
    createSession(sessionId: string): Promise<ISession> | ISession
}

export interface ISessionStore {
    get(key: string): Promise<ISession | undefined> | ISession | undefined
    set(key: string, value: ISession): Promise<void> | void
}

export interface OCSProxyOptions extends FastifyHttpProxyOptions {
    useIdToken?: boolean
}

export type OCSSessionOptions = {
    sessionName: string
    sessionKeys: string[]
    sameSite: boolean | 'strict' | 'lax' | 'none' | undefined
    path?: string
}

export type OCSOptions = {
    resolveContentHandler: () => Promise<ContentHandler>
    appType: AppType
    dev?: boolean
    clientMetadata: ClientMetadata
    challengeMethod?: string
    enableCodeChallenge?: boolean
    issuer: string
    scope: string
    signedOutPage: string
    sessionOptions: OCSSessionOptions
    sessionFactory?: ISessionFactory
    sessionStore?: ISessionStore
    proxyOptions?: OCSProxyOptions[]
    securedPaths?: string[]
}
