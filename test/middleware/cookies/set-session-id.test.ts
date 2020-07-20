import * as cookies from '../../../src/cookies'

import {IncomingMessage, ServerResponse} from 'http'
import sinon, {stubInterface} from 'ts-sinon'

import {Logger} from 'pino'
import {MemorySessionStore} from '../../../src/session'
import {Options} from '../../../src/options'
import {UrlWithParsedQuery} from 'url'
import {cookiesMiddleware} from '../../../src/middleware/cookies-middleware'
import {createContext} from '../../../src/context'
import test from 'ava'

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
        userInfoEndpoint: 'http://not-a-user-info-endpoint.test'
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

test('cookieMiddleware should set sessionId as expected', async t => {
    const store = new MemorySessionStore()
    const cookiesMw = cookiesMiddleware(testOptions, store)
    const reqStub = stubInterface<IncomingMessage>()
    const resStub = stubInterface<ServerResponse>()
    const urlStub = stubInterface<UrlWithParsedQuery>()
    const loggerStub = stubInterface<Logger>()

    const unitTestSessionId = 'unit-test-session-id'
    urlStub.pathname = '/not-a-real-path'

    let ctx = createContext(reqStub, resStub, urlStub, loggerStub)

    const storeSetStub = sinon.stub(store, 'set')
    const cookiesStub = sinon.stub(cookies, 'ensureCookies')
    cookiesStub.returns(unitTestSessionId)
    ctx = await cookiesMw(ctx)

    t.false(ctx.done)
    t.false(loggerStub.error.calledOnce)
    t.true(storeSetStub.calledOnce)
    t.is(storeSetStub.args[0][0], unitTestSessionId)
})
