import type {IncomingMessage, ServerResponse} from 'http'

import {parse} from 'url'
import type {Logger} from 'pino'
// eslint-disable-next-line node/no-deprecated-api
import sinon, {stubInterface} from 'ts-sinon'
import test from 'ava'
import {createContext} from '../../../src/context'
import type {Context} from '../../../src/context'
import type {ClientServerOptions, Options} from '../../../src/options'
import {withBreaker} from '../../../src/middleware/util'

test('withBreaker pass through when url.pathname is undefined', async t => {
    const testName = 'test-middleware'
    const testOptions = stubInterface<Options>()
    const testClientServerOptions = stubInterface<ClientServerOptions>()
    testOptions.clientServerOptions = testClientServerOptions

    const testMw = sinon.stub()
    const testContext = stubInterface<Context>()
    const breakerMw = withBreaker(testMw, testOptions, testName)

    const ctx = await breakerMw(testContext)

    t.true(testMw.notCalled)
    t.is(testContext, ctx)
})

test('withBreaker should skip if path is error page', async t => {
    const testName = 'test-middleware'
    const requestStub = stubInterface<IncomingMessage>()
    const resStub = stubInterface<ServerResponse>()
    const testOptions = stubInterface<Options>()
    const testClientServerOptions = stubInterface<ClientServerOptions>()
    testClientServerOptions.errorPagePath = '/openid-error'
    testOptions.clientServerOptions = testClientServerOptions
    const loggerStub = stubInterface<Logger>()

    const testMw = sinon.stub()
    const testUrl = 'http://unit-test.test/openid-error'
    const parsedUrl = parse(testUrl, true)
    const testContext = createContext(
        requestStub,
        resStub,
        parsedUrl,
        loggerStub
    )
    testContext.url = parse(testUrl, true)
    const breakerMw = withBreaker(testMw, testOptions, testName)

    const ctx = await breakerMw(testContext)

    t.true(testMw.notCalled)
    t.is(testContext, ctx)
})

test('withBreaker should skip of context is done', async t => {
    const testName = 'test-middleware'
    const requestStub = stubInterface<IncomingMessage>()
    const resStub = stubInterface<ServerResponse>()
    const testOptions = stubInterface<Options>()
    const testClientServerOptions = stubInterface<ClientServerOptions>()
    testClientServerOptions.errorPagePath = '/openid-error'
    testOptions.clientServerOptions = testClientServerOptions
    const loggerStub = stubInterface<Logger>()

    const testMw = sinon.stub()
    const testUrl = 'http://unit-test.test/resources/123/items/456'
    const parsedUrl = parse(testUrl, true)
    const testContext = createContext(
        requestStub,
        resStub,
        parsedUrl,
        loggerStub
    )
    testContext.done = true
    testContext.url = parse(testUrl, true)
    const breakerMw2 = withBreaker(testMw, testOptions, testName)

    const ctx = await breakerMw2(testContext)

    t.true(testMw.notCalled)
    t.is(testContext, ctx)
})

test('withBreaker should invoke mw when expected', async t => {
    const testName = 'test-middleware'
    const requestStub = stubInterface<IncomingMessage>()
    const resStub = stubInterface<ServerResponse>()
    const testOptions = stubInterface<Options>()
    const testClientServerOptions = stubInterface<ClientServerOptions>()
    testClientServerOptions.errorPagePath = '/openid-error'
    testOptions.clientServerOptions = testClientServerOptions
    const loggerStub = stubInterface<Logger>()

    const testUrl = 'http://unit-test.test/resources/123/items/456'
    const parsedUrl = parse(testUrl, true)
    const testContext = createContext(
        requestStub,
        resStub,
        parsedUrl,
        loggerStub
    )
    const testMw = sinon.stub().resolves(testContext)
    const breakerMw = withBreaker(testMw, testOptions, testName)

    const ctx = await breakerMw(testContext)

    t.true(testMw.calledOnce)
    t.is(testContext, ctx)
})
