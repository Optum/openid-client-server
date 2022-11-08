import type {IncomingMessage, ServerResponse} from 'http'
import type {UrlWithParsedQuery} from 'url'
import sinon, {stubInterface} from 'ts-sinon'
import type {IdTokenClaims} from 'openid-client'
import type {Logger} from 'pino'
import crs from 'crypto-random-string'
import test from 'ava'
import {v4 as uuid} from 'uuid'
import * as util from '../../../src/middleware/util'

import type {Session, SessionStore} from '../../../src/session'

import {testOptions} from '../../helpers/test-options'
import {createContext} from '../../../src/context'
import {signOutMiddleware} from '../../../src/middleware/signout-middleware'

const redirectStub = sinon.stub(util, 'redirectResponse')

test('signOutMiddleware should destroy session when found in ctx.sessionId', async t => {
    const {signOutPath} = testOptions.clientServerOptions
    const testSessionId = uuid()
    const testSessionState = crs({
        length: 10
    })
    const testCsrfString = crs({
        length: 10
    })
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
            expired() {
                return false
            },
            claims() {
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

    const requestStub = stubInterface<IncomingMessage>()
    const resStub = stubInterface<ServerResponse>()
    const urlStub = stubInterface<UrlWithParsedQuery>()
    const loggerStub = stubInterface<Logger>()

    urlStub.pathname = signOutPath

    let ctx = createContext(requestStub, resStub, urlStub, loggerStub)
    ctx.sessionId = testSessionId
    ctx = await signout(ctx)

    t.true(ctx.done)
    t.is(storeStub.getByPair.callCount, 0)
    t.true(storeStub.destroy.calledWith(testSessionId))
    redirectStub.reset()
})
