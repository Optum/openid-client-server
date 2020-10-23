import {FastifyInstance, FastifyRequest} from 'fastify'
import {Client, Issuer, TokenSet, generators} from 'openid-client'
import {head} from 'ramda'
import {default_code_challenge_method} from './constants'
import assert from 'assert'
import {
    ClientService,
    ContentHandler,
    FastifyContentHandler,
    Options,
    ProxyOptions
} from './types'
import {withFastifyWrapper} from './util'

export class OpenIdClientService implements ClientService {
    // ctor initialized fields
    fastify: FastifyInstance
    options: Options
    name: string

    // internal fields
    _client: Client | undefined
    _contentHandler: ContentHandler | undefined

    constructor(fastify: FastifyInstance, options: Options) {
        this.fastify = fastify
        this.options = options
        this.name = 'OpenIdClientService'
    }

    get client(): Client {
        assert(
            this._client,
            `${this.name}::init must be resolved before calling client`
        )
        return this._client
    }

    get contentHandler(): ContentHandler {
        assert(
            this._contentHandler,
            `${this.name}::init must be resolved before calling contentHandler`
        )
        return this._contentHandler
    }

    async init(): Promise<{
        client: Client
        contentHandler: FastifyContentHandler
    }> {
        const {clientMetadata, issuer, resolveContentHandler} = this.options
        this._contentHandler = await resolveContentHandler()
        const issuerClient = await Issuer.discover(issuer)
        this._client = new issuerClient.Client(clientMetadata)
        return {
            contentHandler: withFastifyWrapper(this._contentHandler),
            client: this._client
        }
    }

    async getTokenSet(
        csrfString: string,
        codeVerifier: string,
        request: FastifyRequest
    ): Promise<TokenSet> {
        const redirectUri = head(this.client.metadata.redirect_uris || [''])
        const callbackParameters = this.client.callbackParams(request.raw)
        return await (this.options.scope?.includes('openid')
            ? this.client.callback(redirectUri, callbackParameters, {
                  state: csrfString,
                  code_verifier: codeVerifier
              })
            : this.client.oauthCallback(redirectUri, callbackParameters, {
                  state: csrfString,
                  code_verifier: codeVerifier
              }))
    }

    getChallengeArguments():
        | {
              code_verifier: string
              code_challenge: string
              code_challenge_method: string
          }
        | {code_verifier?: string} {
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
        proxyOptions: ProxyOptions
    ): (request: FastifyRequest) => Promise<void> {
        const _client = this.client
        return async function (request: FastifyRequest): Promise<void> {
            const _tokenSet = await request.session.get('tokenSet')
            let tokenSet = new TokenSet(_tokenSet)
            if (!request.headers.authorization && tokenSet) {
                if (tokenSet.expired() && tokenSet.refresh_token) {
                    tokenSet = await _client.refresh(tokenSet)
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

export default OpenIdClientService
