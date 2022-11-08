import type {IncomingMessage, ServerResponse} from 'http'
import type {UrlWithParsedQuery} from 'url'
import sinon, {stubInterface} from 'ts-sinon'
import type {Logger} from 'pino'
import test from 'ava'
import * as cookies from '../../../src/cookies'

import {MemorySessionStore} from '../../../src/session'
import {testOptions} from '../../helpers/test-options'
import {cookiesMiddleware} from '../../../src/middleware/cookies-middleware'
import {createContext} from '../../../src/context'

test('cookieMiddleware should set sessionId as expected', async t => {
    const store = new MemorySessionStore()
    const cookiesMw = cookiesMiddleware(testOptions, store)
    const requestStub = stubInterface<IncomingMessage>()
    const resStub = stubInterface<ServerResponse>()
    const urlStub = stubInterface<UrlWithParsedQuery>()
    const loggerStub = stubInterface<Logger>()

    const unitTestSessionId = 'unit-test-session-id'
    urlStub.pathname = '/not-a-real-path'

    let ctx = createContext(requestStub, resStub, urlStub, loggerStub)

    const storeSetStub = sinon.stub(store, 'set')
    const cookiesStub = sinon.stub(cookies, 'ensureCookies')
    cookiesStub.returns(unitTestSessionId)
    ctx = await cookiesMw(ctx)

    t.false(ctx.done)
    t.false(loggerStub.error.calledOnce)
    t.true(storeSetStub.calledOnce)
    t.is(storeSetStub.args[0][0], unitTestSessionId)
})
