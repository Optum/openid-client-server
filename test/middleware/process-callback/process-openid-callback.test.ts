import * as util from '../../../src/middleware/util'

import {Client, TokenSet} from 'openid-client'
import {IncomingMessage, ServerResponse} from 'http'
import sinon, {stubInterface} from 'ts-sinon'

import {Logger} from 'pino'
import {MemorySessionStore} from '../../../src/session'
import {Options} from '../../../src/options'
import {UrlWithParsedQuery} from 'url'
import {createContext} from '../../../src/context'
import crs from 'crypto-random-string'
import {processCallbackMiddleware} from '../../../src/middleware/process-callback-middleware'
import test from 'ava'
import {v4 as uuid} from 'uuid'

const redirectResponseStub = sinon.stub(util, 'redirectResponse')

const testOptions: Options = {
    clientServerOptions: {
        discoveryEndpoint:
            'https://examples.auth0.com/.well-known/openid-configuration',
        signInPath: '/openid/signin',
        callbackPath: '/openid/callback',
        processCallbackPath: '/openid/process-callback',
        signOutPath: '/openid/signout',
        userInfoPath: '/openid/userinfo',
        errorPagePath: '/openid-error',
        enablePKCE: false,
        enableOauth2: false,
        authorizationEndpoint: 'http://not-an-authorization-endpoint.test',
        tokenEndpoint: 'http://not-a-token-endpoint.test',
        userInfoEndpoint: 'http://not-a-user-info-endpoint.test',
        scope: 'openid'
    },
    sessionOptions: {
        sessionKeys: ['test-session-keys'],
        sessionName: 'openid:session',
        sameSite: true
    },
    clientMetadata: {client_id: 'test-client-id'},
    loggerOptions: {
        level: 'silent',
        useLevelLabels: true,
        name: 'openid-client-server'
    },
    proxyOptions: {
        proxyPaths: [],
        proxyHosts: [],
        excludeCookie: [],
        useIdToken: []
    }
}

test('processCallbackMiddleware should process openid callback and redirect to fromUrl', async t => {
    const {processCallbackPath} = testOptions.clientServerOptions
    const clientStub = stubInterface<Client>()
    const tokenSetStub = stubInterface<TokenSet>()
    const sessionStore = new MemorySessionStore()
    const testSessionId = uuid()
    const testCsrfString = crs({length: 10})
    const testSessionState = crs({length: 10})
    const testCode = crs({length: 128})
    const testRedirectUrl = '/home-test'

    clientStub.callbackParams.returns({
        code: testCode,
        session_state: testSessionState
    })

    clientStub.callback.resolves(tokenSetStub)

    await sessionStore.set(testSessionId, {
        createdAt: Date.now(),
        csrfString: testCsrfString,
        fromUrl: testRedirectUrl
    })

    const processCallback = processCallbackMiddleware(
        clientStub,
        processCallbackPath,
        testOptions,
        sessionStore
    )

    const reqStub = stubInterface<IncomingMessage>()
    const resStub = stubInterface<ServerResponse>()
    const urlStub = stubInterface<UrlWithParsedQuery>()
    const loggerStub = stubInterface<Logger>()
    urlStub.pathname = processCallbackPath

    let ctx = createContext(reqStub, resStub, urlStub, loggerStub)
    ctx.sessionId = testSessionId

    ctx = await processCallback(ctx)

    const testSession = await sessionStore.get(testSessionId)

    t.true(ctx.done)
    t.true(clientStub.callbackParams.calledOnce)
    t.true(clientStub.callback.calledOnce)
    t.true(redirectResponseStub.calledOnce)
    t.is(redirectResponseStub.args[0][0], testRedirectUrl)
    t.is(redirectResponseStub.args[0][1], ctx.res)
    t.is(testSession?.tokenSet, tokenSetStub)
    t.is(testSession?.sessionState, testSessionState)
    t.is(testSession?.csrfString, null)
    t.is(testSession?.codeVerifier, null)
    t.is(testSession?.fromUrl, null)
    t.is(testSession?.securedPathFromUrl, null)
    redirectResponseStub.reset()
})
