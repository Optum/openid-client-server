import type {IncomingMessage, ServerResponse} from 'http'
import type {UrlWithParsedQuery} from 'url'
import type {Client, TokenSet} from 'openid-client'
import sinon, {stubInterface} from 'ts-sinon'
import type {Logger} from 'pino'
import crs from 'crypto-random-string'
import test from 'ava'
import {v4 as uuid} from 'uuid'
import * as util from '../../../src/middleware/util'

import {MemorySessionStore} from '../../../src/session'
import {makeOptionsWithScope} from '../../helpers/test-options'
import {createContext} from '../../../src/context'
import {processCallbackMiddleware} from '../../../src/middleware/process-callback-middleware'

const redirectResponseStub = sinon.stub(util, 'redirectResponse')

const testOptions = makeOptionsWithScope('openid')

test('processCallbackMiddleware should process openid callback and redirect to fromUrl', async t => {
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

    const requestStub = stubInterface<IncomingMessage>()
    const resStub = stubInterface<ServerResponse>()
    const urlStub = stubInterface<UrlWithParsedQuery>()
    const loggerStub = stubInterface<Logger>()
    urlStub.pathname = processCallbackPath

    let ctx = createContext(requestStub, resStub, urlStub, loggerStub)
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
