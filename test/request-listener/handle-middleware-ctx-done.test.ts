import * as middleware from '../../src/middleware'
import * as spcMiddleware from '../../src/middleware/secure-path-check-middleware'

import {Request, Response} from 'mock-http'

import {Context} from '../../src/context'
import {MemorySessionStore} from '../../src/session'
import {Options} from '../../src/options'
import createAsyncPipe from 'p-pipe'
import {createRequestListener} from '../../src'
import sinon from 'ts-sinon'
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

const createMiddlewareStub = sinon.stub(middleware, 'createMiddleware')
const securePathCheckMiddlewareStub = sinon.stub(
    spcMiddleware,
    'securePathCheckMiddleware'
)

test('createRequestListener should skip remaining if ctx is done', async t => {
    const sessionStore = new MemorySessionStore()
    const reqMock = new Request()
    const resMock = new Response()
    const testUrl = 'http://unit-test.test/resource'
    reqMock.url = testUrl

    // create test openid middleware
    const testMiddlewarePipe = createAsyncPipe((ctx: Context) => {
        t.is(ctx.req, reqMock)
        t.is(ctx.req.url, testUrl)
        t.is(ctx.res, resMock)
        ctx.done = true
        return ctx
    })
    createMiddlewareStub.returns(testMiddlewarePipe)

    // create test secure path check middleware
    const testPathCheckPipe = createAsyncPipe(() => true)
    securePathCheckMiddlewareStub.returns(testPathCheckPipe)

    const requestListener = await createRequestListener(
        testOptions,
        sessionStore
    )

    requestListener(reqMock, resMock)

    t.true(createMiddlewareStub.calledOnce)
    t.true(securePathCheckMiddlewareStub.calledOnce)
    createMiddlewareStub.reset()
    securePathCheckMiddlewareStub.reset()
})
