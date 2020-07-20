import * as util from '../../../src/middleware/util'

import {Client, IdTokenClaims} from 'openid-client'
import {IncomingMessage, ServerResponse} from 'http'
import sinon, {stubInterface} from 'ts-sinon'

import {Logger} from 'pino'
import {MemorySessionStore} from '../../../src/session'
import {Options} from '../../../src/options'
import {createContext} from '../../../src/context'
import crs from 'crypto-random-string'
// eslint-disable-next-line node/no-deprecated-api
import {parse} from 'url'
import {securePathCheckMiddleware} from '../../../src/middleware/secure-path-check-middleware'
import test from 'ava'

const testPath = '/dashboard'

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
        userInfoEndpoint: 'http://not-a-user-info-endpoint.test',
        securedPaths: [testPath]
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

test('securePathCheckMiddleware check false if invalid session and path match', async t => {
    const sessionStore = new MemorySessionStore()
    const clientStub = stubInterface<Client>()
    const reqStub = stubInterface<IncomingMessage>()
    const resStub = stubInterface<ServerResponse>()
    const idTokenClaimsStrub = stubInterface<IdTokenClaims>()
    const loggerStub = stubInterface<Logger>()

    const parsedUrl = parse(`http://unit-test.test${testPath}`, true)

    const ctx = createContext(reqStub, resStub, parsedUrl, loggerStub)
    ctx.sessionId = crs({length: 10})

    const tokenSet = {
        expired(): boolean {
            return true
        },
        claims(): IdTokenClaims {
            return idTokenClaimsStrub
        }
    }

    await sessionStore.set(ctx.sessionId, {
        tokenSet
    })

    const middleware = securePathCheckMiddleware(
        testOptions,
        sessionStore,
        clientStub
    )

    const passToHandler = await middleware(ctx)

    const session = await sessionStore.get(ctx.sessionId)

    t.false(passToHandler)
    t.true(redirectStub.calledOnce)
    t.is(
        session?.securedPathFromUrl,
        `${testPath}${
            parsedUrl.search && parsedUrl.search.trim() !== ''
                ? parsedUrl.search
                : ''
        }`
    )
    t.is(redirectStub.args[0][0], testOptions.clientServerOptions.signInPath)
    t.is(redirectStub.args[0][1], resStub)
})
