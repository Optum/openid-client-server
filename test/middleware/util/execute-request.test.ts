import {parse} from 'url'
import {Request, Response} from 'mock-http'
import sinon, {stubInterface} from 'ts-sinon'

import type {Logger} from 'pino'
import nock from 'nock'
import test from 'ava'
import {createContext} from '../../../src/context'
import {executeRequest} from '../../../src/middleware/util'
// eslint-disable-next-line node/no-deprecated-api

const testProxyHost = 'http://downstream-test.test'

test.before('setup nock', () => {
    nock(testProxyHost).post('/widgets').reply(200, '')
})

test('executeRequest should fetch from expected url', async t => {
    const testToken = 'totally-a-legit-token'
    const testExcludeCookie = false
    const testExcludeOriginHeaders = false
    const testMethod = 'post'
    const testPathname = '/widgets'
    const testProxyPathname = '/proxy'
    const testBody = 'name=test&other=thing'
    const testHeaders = {
        'Context-Type': 'text/plain'
    }
    const request = new Request({
        headers: testHeaders,
        buffer: Buffer.from(testBody)
    })
    const onEndStub = sinon.stub()
    const res = new Response({
        onEnd: onEndStub
    })
    const testUrl = `http://unit-test.test${testProxyPathname}${testPathname}`
    const parsedUrl = parse(testUrl, true)
    const loggerStub = stubInterface<Logger>()
    const testContext = createContext(request, res, parsedUrl, loggerStub)

    await executeRequest({
        token: testToken,
        excludeCookie: testExcludeCookie,
        excludeOriginHeaders: testExcludeOriginHeaders,
        host: testProxyHost,
        pathname: testProxyPathname,
        ctx: testContext,
        method: testMethod
    })

    t.is(
        String(loggerStub.debug.args[0][0]),
        `fetching ${testProxyHost}${testPathname}`
    )
})
