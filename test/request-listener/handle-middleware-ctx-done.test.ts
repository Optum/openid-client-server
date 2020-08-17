import * as middleware from '../../src/middleware'
import * as spcMiddleware from '../../src/middleware/secure-path-check-middleware'

import {Request, Response} from 'mock-http'
import nock from 'nock'
import {Context} from '../../src/context'
import {MemorySessionStore} from '../../src/session'
import createAsyncPipe from 'p-pipe'
import {createRequestListener} from '../../src'
import {
    discoveryPath,
    issuer,
    openIdDiscoveryConfiguration,
    testOptions
} from '../helpers/test-options'
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

test('createRequestListener should skip remaining if ctx is done', async t => {
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
        ctx.done = true
        return ctx
    })
    createMiddlewareStub.returns(testMiddlewarePipe)

    // create test secure path check middleware
    const testPathCheckPipe = createAsyncPipe(() => true)
    securePathCheckMiddlewareStub.returns(testPathCheckPipe)

    const requestListener = await createRequestListener(
        testOptions,
        sessionStore
    )

    requestListener(reqMock, resMock)

    t.true(createMiddlewareStub.calledOnce)
    t.true(securePathCheckMiddlewareStub.calledOnce)
    createMiddlewareStub.reset()
    securePathCheckMiddlewareStub.reset()
})
