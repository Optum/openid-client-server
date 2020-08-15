import * as middleware from '../../src/middleware'
import * as spcMiddleware from '../../src/middleware/secure-path-check-middleware'
import nock from 'nock'
import {IncomingMessage, ServerResponse} from 'http'
import {Request, Response} from 'mock-http'
import {
    RequestListenerEventEmitter,
    RequestListenerEvents,
    createRequestListener
} from '../../src'

import {Context} from '../../src/context'
import {MemorySessionStore} from '../../src/session'
import {
    discoveryPath,
    issuer,
    openIdDiscoveryConfiguration,
    testOptionsWithEmitEvents
} from '../helpers/test-options'
import createAsyncPipe from 'p-pipe'
import pEvent from 'p-event'
import sinon from 'ts-sinon'
import test from 'ava'

const createMiddlewareStub = sinon.stub(middleware, 'createMiddleware')
const securePathCheckMiddlewareStub = sinon.stub(
    spcMiddleware,
    'securePathCheckMiddleware'
)

test.beforeEach(t => {
    t.context = nock(issuer)
        .get(discoveryPath)
        .reply(200, openIdDiscoveryConfiguration)
})

test('createRequestListener should call secure path check mw if not done', async t => {
    t.plan(11)
    const sessionStore = new MemorySessionStore()
    const reqMock = new Request()
    const resMock = new Response()
    const testUrl = 'http://unit-test.test/resource'
    reqMock.url = testUrl

    // create test openid middleware
    const testMiddlewarePipe = createAsyncPipe((ctx: Context) => {
        t.is(ctx.req, reqMock)
        t.is(ctx.req.url, testUrl)
        t.is(ctx.res, resMock)
        ctx.done = false
        return ctx
    })
    createMiddlewareStub.returns(testMiddlewarePipe)

    // create test secure path check middleware
    const testPathCheckPipe = createAsyncPipe((ctx: Context) => {
        t.is(ctx.req, reqMock)
        t.is(ctx.req.url, testUrl)
        t.is(ctx.res, resMock)
        return true
    })
    securePathCheckMiddlewareStub.returns(testPathCheckPipe)

    const requestHandler = async (
        req: IncomingMessage,
        res: ServerResponse
    ): Promise<void> => {
        t.is(req, reqMock)
        t.is(req.url, testUrl)
        t.is(res, resMock)
    }

    const requestListener = await createRequestListener(
        testOptionsWithEmitEvents,
        sessionStore,
        requestHandler
    )

    requestListener(reqMock, resMock)

    await pEvent(RequestListenerEventEmitter, RequestListenerEvents.COMPLETED)

    t.true(createMiddlewareStub.calledOnce)
    t.true(securePathCheckMiddlewareStub.calledOnce)
    createMiddlewareStub.reset()
    securePathCheckMiddlewareStub.reset()
})
