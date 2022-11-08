import {PassThrough} from 'stream'
import {Request, Response} from 'mock-http'
import nock from 'nock'
import sinon, {stubObject} from 'ts-sinon'
import test from 'ava'
import {createRequestListener, resolveOptions} from '../../src'
import {MemorySessionStore} from '../../src'
import type {Options} from '../../src'
import {discoveryPath, issuer, testOptions} from '../helpers/test-options'
import openIdDiscoveryConfiguration from '../helpers/example-openid-configuration.json'
import {clone} from '../../src/middleware/util'

test.beforeEach(t => {
    t.context = nock(issuer)
        .get(discoveryPath)
        .reply(200, openIdDiscoveryConfiguration)
})

test('createRequestListener & resolveOptions should exist', t => {
    t.truthy(createRequestListener)
    t.truthy(resolveOptions)
})

test('createRequestListener should do nothing if req.url is undefined and requestHandler is not provided', async t => {
    const sessionStore = new MemorySessionStore()
    const logWriteStub = sinon.stub()
    const requestMock = new Request()
    const resMock = new Response()

    requestMock.url = undefined

    const options = clone(testOptions) as Options
    options.loggerOptions.level = 'debug'

    const passThroughStream = new PassThrough()

    const stubStream = stubObject(passThroughStream)
    stubStream.write.callsFake(logWriteStub)
    options.loggerDestination = stubStream

    const requestListener = await createRequestListener(options, sessionStore)

    requestListener(requestMock, resMock)

    t.is(logWriteStub.callCount, 3)
    t.is(
        JSON.parse(logWriteStub.args[2][0]).msg,
        'req url & requestHandler not defined'
    )
})

test('createRequestListener should pass request to provided handler if req.url is undefined', async t => {
    const sessionStore = new MemorySessionStore()
    const requestHandlerStub = sinon.stub().resolves('OK')
    const requestMock = new Request()
    const resMock = new Response()

    requestMock.url = undefined

    const requestListener = await createRequestListener(
        testOptions,
        sessionStore,
        requestHandlerStub
    )

    requestListener(requestMock, resMock)

    t.true(requestHandlerStub.calledOnce)
    t.is(requestHandlerStub.args[0][0], requestMock)
    t.is(requestHandlerStub.args[0][1], resMock)
    t.is(requestHandlerStub.args[0][2], undefined)
})
