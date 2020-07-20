import * as util from '../../../src/middleware/util'

import {IncomingMessage, ServerResponse} from 'http'
import {Session, SessionStore} from '../../../src/session'
import sinon, {stubInterface} from 'ts-sinon'

import {IdTokenClaims} from 'openid-client'
import {Logger} from 'pino'
import {Options} from '../../../src/options'
import {UrlWithParsedQuery} from 'url'
import {createContext} from '../../../src/context'
import crs from 'crypto-random-string'
import {signOutMiddleware} from '../../../src/middleware/signout-middleware'
import test from 'ava'
import {v4 as uuid} from 'uuid'

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

test('signOutMiddleware should destroy session when found in ctx.sessionId', async t => {
    const {signOutPath} = testOptions.clientServerOptions
    const testSessionId = uuid()
    const testSessionState = crs({length: 10})
    const testCsrfString = crs({length: 10})
    const testRedirectUrl = '/home-test'
    const claims = stubInterface<IdTokenClaims>()

    const stubSession: Session = {
        sessionId: testSessionId,
        createdAt: Date.now(),
        csrfString: testCsrfString,
        fromUrl: testRedirectUrl,
        codeVerifier: '',
        userInfo: {sub: ''},
        tokenSet: {
            expired: () => {
                return false
            },
            claims: () => {
                return claims
            }
        },
        sessionState: '',
        securedPathFromUrl: ''
    }

    const storeStub = stubInterface<SessionStore>()
    storeStub.getByPair
        .withArgs('sessionState', String(testSessionState))
        .resolves(stubSession)

    const signout = signOutMiddleware(signOutPath, testOptions, storeStub)

    const reqStub = stubInterface<IncomingMessage>()
    const resStub = stubInterface<ServerResponse>()
    const urlStub = stubInterface<UrlWithParsedQuery>()
    const loggerStub = stubInterface<Logger>()

    urlStub.pathname = signOutPath

    let ctx = createContext(reqStub, resStub, urlStub, loggerStub)
    ctx.sessionId = testSessionId
    ctx = await signout(ctx)

    t.true(ctx.done)
    t.is(storeStub.getByPair.callCount, 0)
    t.true(storeStub.destroy.calledWith(testSessionId))
    redirectStub.reset()
})
