import {FastifyInstance, FastifyRequest} from 'fastify'
import {Client, Issuer, TokenSet, generators} from 'openid-client'
import {head} from 'ramda'
import {
    ChallengeArguments,
    ContentHandler,
    OCSOptions,
    OCSProxyOptions
} from './types'
import {default_code_challenge_method} from './constants'
import assert from 'assert'

export class OpenIdClientService {
    fastify: FastifyInstance
    options: OCSOptions
    name: string
    _client: Client | undefined

    constructor(fastify: FastifyInstance, options: OCSOptions) {
        this.fastify = fastify
        this.options = options
        this.name = 'OpenIdClientService'
    }

    get client(): Client {
        assert(
            this._client,
            `${this.name}::init must be resolved before calling getTokenSet`
        )
        return this._client
    }

    async init(): Promise<{contentHandler: ContentHandler; client: Client}> {
        const {clientMetadata, issuer, resolveContentHandler} = this.options
        const contentHandler = await resolveContentHandler()
        const issuerClient = await Issuer.discover(issuer)
        this._client = new issuerClient.Client(clientMetadata)
        return {
            contentHandler,
            client: this._client
        }
    }

    async getTokenSet(
        csrfString: string,
        codeVerifier: string,
        request: FastifyRequest
    ): Promise<TokenSet> {
        const redirectUri = head<string>(
            this.client.metadata.redirect_uris ?? ['']
        )
        const callbackParameters = this.client.callbackParams(request.raw)
        if (this.options.scope.includes('openid')) {
            return await this.client.callback(redirectUri, callbackParameters, {
                state: csrfString,
                code_verifier: codeVerifier
            })
        } else {
            return await this.client.oauthCallback(
                redirectUri,
                callbackParameters,
                {
                    state: csrfString,
                    code_verifier: codeVerifier
                }
            )
        }
    }

    getChallengeArguments(): Partial<ChallengeArguments> {
        if (this.options.enableCodeChallenge) {
            const code_verifier = generators.codeVerifier()
            const code_challenge = generators.codeChallenge(code_verifier)

            return {
                code_verifier,
                code_challenge,
                code_challenge_method:
                    this.options.challengeMethod ??
                    default_code_challenge_method
            }
        }

        return {}
    }

    addInAuthorizationHeader(
        proxyOptions: OCSProxyOptions
    ): (request: FastifyRequest) => Promise<void> {
        const client = this.client
        return async function (request: FastifyRequest): Promise<void> {
            let tokenSet: TokenSet = (await request.session.get(
                'tokenSet'
            )) as TokenSet
            if (!request.headers.authorization && tokenSet) {
                if (tokenSet.expired() && tokenSet.refresh_token) {
                    tokenSet = await client.refresh(tokenSet)
                    await request.session.set('tokenSet', tokenSet)
                }
                request.headers.authorization = `Bearer ${
                    proxyOptions.useIdToken
                        ? tokenSet.id_token
                        : tokenSet.access_token
                }`
            }
        }
    }
}
