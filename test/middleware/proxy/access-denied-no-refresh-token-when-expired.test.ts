import type {IncomingMessage, ServerResponse} from 'http'
import type {UrlWithParsedQuery} from 'url'
import type {Client, IdTokenClaims, TokenSet} from 'openid-client'
import sinon, {stubInterface} from 'ts-sinon'
import type {Logger} from 'pino'
import test from 'ava'
import * as util from '../../../src/middleware/util'

import {MemorySessionStore} from '../../../src/session'
import {createContext} from '../../../src/context'
import {proxyMiddleware} from '../../../src/middleware/proxy-middleware'

const sendJsonResponseStub = sinon.stub(util, 'sendJsonResponse')

test('proxyMiddlware should throw access denied when no refresh token is present', async t => {
    const clientStub = stubInterface<Client>()
    const idTokenClaimsStub = stubInterface<IdTokenClaims>()
    const store = new MemorySessionStore()
    const host = 'http://unit-test:0000'
    const pathname = '/unit-test-proxy'
    const excludeCookie = false
    const excludeOriginHeaders = false
    const useIdToken = false

    const proxy = proxyMiddleware({
        host,
        pathname,
        excludeCookie,
        excludeOriginHeaders,
        useIdToken,
        sessionStore: store,
        client: clientStub
    })

    const requestStub = stubInterface<IncomingMessage>()
    const resStub = stubInterface<ServerResponse>()
    const urlStub = stubInterface<UrlWithParsedQuery>()
    const loggerStub = stubInterface<Logger>()
    urlStub.pathname = pathname

    const testSessionId = 'asdfington'
    let ctx = createContext(requestStub, resStub, urlStub, loggerStub)
    ctx.sessionId = testSessionId

    requestStub.method = 'GET'

    const expiredStub = sinon.stub()

    expiredStub.returns(true)

    const tokenSet: TokenSet = {
        claims: () => idTokenClaimsStub,
        access_token: undefined,
        refresh_token: undefined,
        expired: expiredStub
    }

    const storeGetStub = sinon.stub(store, 'get')

    storeGetStub.returns(
        Promise.resolve({
            sessionId: testSessionId,
            createdAt: Date.now(),
            csrfString: null,
            codeVerifier: null,
            tokenSet,
            userInfo: null,
            sessionState: null,
            fromUrl: null,
            securedPathFromUrl: null
        })
    )

    ctx = await proxy(ctx)

    t.true(ctx.done)
    t.true(expiredStub.calledOnce)
    t.true(sendJsonResponseStub.calledOnce)
    t.true(storeGetStub.calledOnce)
    sendJsonResponseStub.reset()
})
