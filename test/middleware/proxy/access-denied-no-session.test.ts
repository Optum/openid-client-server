import type {IncomingMessage, ServerResponse} from 'http'
import type {UrlWithParsedQuery} from 'url'
import sinon, {stubInterface} from 'ts-sinon'
import type {Client} from 'openid-client'
import type {Logger} from 'pino'
import test from 'ava'
import * as util from '../../../src/middleware/util'

import {MemorySessionStore} from '../../../src/session'
import {createContext} from '../../../src/context'
import {proxyMiddleware} from '../../../src/middleware/proxy-middleware'

const sendJsonResponseStub = sinon.stub(util, 'sendJsonResponse')

test('proxyMiddlware should throw access denied when no session id is present', async t => {
    const clientStub = stubInterface<Client>()
    const store = new MemorySessionStore()
    const host = 'http://unit-test:0000'
    const pathname = '/unit-test-proxy'
    const excludeCookie = false
    const excludeOriginHeaders = false

    const useIdToken = false

    const proxy = proxyMiddleware({
        host,
        pathname,
        excludeCookie,
        excludeOriginHeaders,
        useIdToken,
        sessionStore: store,
        client: clientStub
    })

    const requestStub = stubInterface<IncomingMessage>()
    const resStub = stubInterface<ServerResponse>()
    const urlStub = stubInterface<UrlWithParsedQuery>()
    const loggerStub = stubInterface<Logger>()
    urlStub.pathname = pathname

    const testSessionId = 'asdfington'
    let ctx = createContext(requestStub, resStub, urlStub, loggerStub)
    ctx.sessionId = testSessionId

    const getSpy = sinon.spy(store, 'get')

    ctx = await proxy(ctx)

    t.true(ctx.done)
    t.true(sendJsonResponseStub.calledOnce)
    t.true(getSpy.calledOnce)
    sendJsonResponseStub.reset()
})
