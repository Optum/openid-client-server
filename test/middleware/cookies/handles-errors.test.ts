import type {IncomingMessage, ServerResponse} from 'http'
import type {UrlWithParsedQuery} from 'url'
import sinon, {stubInterface} from 'ts-sinon'
import type {Logger} from 'pino'
import test from 'ava'
import * as util from '../../../src/middleware/util'

import {MemorySessionStore} from '../../../src/session'
import {testOptions} from '../../helpers/test-options'
import {cookiesMiddleware} from '../../../src/middleware/cookies-middleware'
import {createContext} from '../../../src/context'

const redirectStub = sinon.stub(util, 'redirectResponse')

test('cookieMiddleware handles errors expected', async t => {
    const {errorPagePath} = testOptions.clientServerOptions
    const store = new MemorySessionStore()
    const cookies = cookiesMiddleware(testOptions, store)

    const requestStub = stubInterface<IncomingMessage>()
    const resStub = stubInterface<ServerResponse>()
    const urlStub = stubInterface<UrlWithParsedQuery>()
    const loggerStub = stubInterface<Logger>()

    urlStub.pathname = '/not-a-real-path'

    let ctx = createContext(requestStub, resStub, urlStub, loggerStub)

    ctx = await cookies(ctx)

    t.true(ctx.done)
    t.true(loggerStub.error.calledOnce)
    t.is(redirectStub.args[0][0], `${errorPagePath}?sc=500&sn=1`)
    redirectStub.reset()
})
