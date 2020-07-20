import * as util from '../../../src/middleware/util'

import {Client, IdTokenClaims, TokenSet} from 'openid-client'
import {IncomingMessage, ServerResponse} from 'http'
import sinon, {stubInterface} from 'ts-sinon'

import {Logger} from 'pino'
import {MemorySessionStore} from '../../../src/session'
import {UrlWithParsedQuery} from 'url'
import {createContext} from '../../../src/context'
import {proxyMiddleware} from '../../../src/middleware/proxy-middleware'
import test from 'ava'

const sendJsonResponseStub = sinon.stub(util, 'sendJsonResponse')

test('proxyMiddlware should throw access denied when no refresh token is present', async t => {
    const clientStub = stubInterface<Client>()
    const idTokenClaimsStub = stubInterface<IdTokenClaims>()
    const store = new MemorySessionStore()
    const host = 'http://unit-test:0000'
    const pathname = '/unit-test-proxy'
    const excludeCookie = false
    const useIdToken = false

    const proxy = proxyMiddleware({
        host,
        pathname,
        excludeCookie,
        useIdToken,
        sessionStore: store,
        client: clientStub
    })

    const reqStub = stubInterface<IncomingMessage>()
    const resStub = stubInterface<ServerResponse>()
    const urlStub = stubInterface<UrlWithParsedQuery>()
    const loggerStub = stubInterface<Logger>()
    urlStub.pathname = pathname

    const testSessionId = 'asdfington'
    let ctx = createContext(reqStub, resStub, urlStub, loggerStub)
    ctx.sessionId = testSessionId

    reqStub.method = 'GET'

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
