import * as util from '../../../src/middleware/util'

import {IncomingMessage, ServerResponse} from 'http'
import {Session, SessionStore} from '../../../src/session'
import sinon, {stubInterface} from 'ts-sinon'

import {IdTokenClaims} from 'openid-client'
import {Logger} from 'pino'
import {testOptions} from '../../helpers/test-options'
import {UrlWithParsedQuery} from 'url'
import {createContext} from '../../../src/context'
import crs from 'crypto-random-string'
import {signOutMiddleware} from '../../../src/middleware/signout-middleware'
import test from 'ava'
import {v4 as uuid} from 'uuid'

const redirectStub = sinon.stub(util, 'redirectResponse')

test('signOutMiddleware should redirect to logout when no session found', async t => {
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

    ctx = await signout(ctx)

    t.true(ctx.done)
    t.is(storeStub.getByPair.callCount, 0)
    t.is(storeStub.destroy.callCount, 0)
    redirectStub.reset()
})
