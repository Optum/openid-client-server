import * as util from '../../../src/middleware/util'

import {Client, TokenSet} from 'openid-client'
import {IncomingMessage, ServerResponse} from 'http'
import sinon, {stubInterface} from 'ts-sinon'

import {Logger} from 'pino'
import {MemorySessionStore} from '../../../src/session'
import {testOptions} from '../../helpers/test-options'
import {UrlWithParsedQuery} from 'url'
import {createContext} from '../../../src/context'
import crs from 'crypto-random-string'
import {processCallbackMiddleware} from '../../../src/middleware/process-callback-middleware'
import test from 'ava'
import {v4 as uuid} from 'uuid'

const redirectResponseStub = sinon.stub(util, 'redirectResponse')

test('processCallbackMiddleware should process oauth callback and redirect to securedPathFromUrl', async t => {
    const {processCallbackPath} = testOptions.clientServerOptions
    const clientStub = stubInterface<Client>()
    const tokenSetStub = stubInterface<TokenSet>()
    const sessionStore = new MemorySessionStore()
    const testSessionId = uuid()
    const testCsrfString = crs({
        length: 10
    })
    const testSessionState = crs({
        length: 10
    })
    const testCode = crs({length: 128})
    const testRedirectUrl = '/home-test'

    clientStub.callbackParams.returns({
        code: testCode,
        session_state: testSessionState
    })

    clientStub.oauthCallback.resolves(tokenSetStub)

    await sessionStore.set(testSessionId, {
        createdAt: Date.now(),
        csrfString: testCsrfString,
        securedPathFromUrl: testRedirectUrl
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
    t.true(clientStub.oauthCallback.calledOnce)
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
