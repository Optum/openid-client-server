import {IncomingMessage, ServerResponse} from 'http'
import {FastifyReply, FastifyRequest} from 'fastify'
import {Client, TokenSet} from 'openid-client'
import {SecureSessionPluginOptions} from 'fastify-secure-session'

export enum AppType {
    STATIC = 0,
    NEXTJS
}

export interface OpenIdRoutes {
    userinfo?: string
    signout?: string
    signin?: string
    error?: string
    callback?: string
    signedOut?: string
}

export interface ProxyOptions {
    upstream: string
    prefix: string
    useIdToken?: boolean
}

export type FastifyContentHandler = (
    request: FastifyRequest,
    reply: FastifyReply
) => Promise<void>

export type ContentHandler = (
    request: IncomingMessage,
    response: ServerResponse
) => Promise<void>

export interface ClientService {
    client: Client
    init(): Promise<{
        client: Client
        contentHandler: FastifyContentHandler
    }>
    getTokenSet(
        csrfString: string,
        codeVerifier: string,
        request: FastifyRequest
    ): Promise<TokenSet>
    addInAuthorizationHeader(
        proxyOptions: ProxyOptions
    ): (request: FastifyRequest) => Promise<void>
    getChallengeArguments():
        | {
              code_verifier: string
              code_challenge: string
              code_challenge_method: string
          }
        | {code_verifier?: string}
}

export interface Options {
    dev?: boolean
    appType: AppType
    clientMetadata: {
        client_id: string
        client_secret: string
        redirect_uris: [string]
        response_types?: ['code']
    }
    openidRoutes?: OpenIdRoutes
    proxyOptions?: ProxyOptions[]
    securedPaths?: {
        securedPaths?: string[]
        securedAsAllowedPaths?: boolean
        useStartsWithCompare?: boolean
    }
    issuer: string
    scope?: string
    enableCodeChallenge?: boolean
    challengeMethod?: string
    sessionOptions: SecureSessionPluginOptions
    resolveContentHandler(): Promise<ContentHandler>
    service: ClientService
}
