import {Request, Response} from 'mock-http'
import {createRequestListener, resolveOptions} from '../../src'

import {MemorySessionStore} from '../../src/session'
import {Options} from '../../src/options'
import {clone} from '../../src/middleware/util'
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

test('createRequestListener & resolveOptions should exist', t => {
    t.truthy(createRequestListener)
    t.truthy(resolveOptions)
})

test('createRequestListener should do nothing if req.url is undefined and requestHandler is not provided', async t => {
    const sessionStore = new MemorySessionStore()
    const logWriteStub = sinon.stub()
    const reqMock = new Request()
    const resMock = new Response()

    reqMock.url = undefined

    const options = clone(testOptions) as Options
    options.loggerOptions.level = 'debug'
    // mock a stdout stream
    options.loggerDestination = {
        write: logWriteStub
    }

    const requestListener = await createRequestListener(options, sessionStore)

    requestListener(reqMock, resMock)

    t.is(logWriteStub.callCount, 3)
    t.is(
        JSON.parse(logWriteStub.args[2][0]).msg,
        'req url & requestHandler not defined'
    )
})

test('createRequestListener should pass request to provided handler if req.url is undefined', async t => {
    const sessionStore = new MemorySessionStore()
    const requestHandlerStub = sinon.stub().resolves('OK')
    const reqMock = new Request()
    const resMock = new Response()

    reqMock.url = undefined

    const requestListener = await createRequestListener(
        testOptions,
        sessionStore,
        requestHandlerStub
    )

    requestListener(reqMock, resMock)

    t.true(requestHandlerStub.calledOnce)
    t.is(requestHandlerStub.args[0][0], reqMock)
    t.is(requestHandlerStub.args[0][1], resMock)
    t.is(requestHandlerStub.args[0][2], undefined)
})
