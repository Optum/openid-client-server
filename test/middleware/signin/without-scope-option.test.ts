import * as util from '../../../src/middleware/util'

import {IncomingMessage, ServerResponse} from 'http'
import sinon, {stubInterface} from 'ts-sinon'

import {Client} from 'openid-client'
import {Logger} from 'pino'
import {MemorySessionStore} from '../../../src/session'
import {Options} from '../../../src/options'
import {UrlWithParsedQuery} from 'url'
import {createContext} from '../../../src/context'
import {signInMiddleware} from '../../../src/middleware/signin-middleware'
import test from 'ava'

const redirectStub = sinon.stub(util, 'redirectResponse')

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

test('signInMiddleware should not include scope in auth url if not in clientServerOptions', async t => {
    const {signInPath} = testOptions.clientServerOptions
    const clientStub = stubInterface<Client>()
    const store = new MemorySessionStore()
    const testOptionsWithScope = util.clone(testOptions) as Options
    const unitTestSessionId = 'unit-test-session-id'
    const unitTestAuthUrl =
        'https://examples.auth0.com/authorize?scope=api://unit-test/access'

    const signin = signInMiddleware(
        clientStub,
        signInPath,
        testOptionsWithScope,
        store
    )

    const reqStub = stubInterface<IncomingMessage>()
    const resStub = stubInterface<ServerResponse>()
    const urlStub = stubInterface<UrlWithParsedQuery>()
    const loggerStub = stubInterface<Logger>()
    urlStub.pathname = signInPath

    let ctx = createContext(reqStub, resStub, urlStub, loggerStub)
    ctx.sessionId = unitTestSessionId
    clientStub.authorizationUrl.returns(unitTestAuthUrl)

    const storeSetSpy = sinon.spy(store, 'set')

    ctx = await signin(ctx)

    t.true(ctx.done)
    t.true(storeSetSpy.calledOnce)
    t.is(storeSetSpy.args[0][0], unitTestSessionId)
    t.is(clientStub.authorizationUrl.args[0][0]?.scope, undefined)
    t.is(redirectStub.args[0][0], unitTestAuthUrl)
    redirectStub.reset()
})
