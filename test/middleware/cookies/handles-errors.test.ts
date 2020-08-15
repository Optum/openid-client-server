import * as util from '../../../src/middleware/util'

import {IncomingMessage, ServerResponse} from 'http'
import sinon, {stubInterface} from 'ts-sinon'

import {Logger} from 'pino'
import {MemorySessionStore} from '../../../src/session'
import {testOptions} from '../../helpers/test-options'
import {UrlWithParsedQuery} from 'url'
import {cookiesMiddleware} from '../../../src/middleware/cookies-middleware'
import {createContext} from '../../../src/context'
import test from 'ava'

const redirectStub = sinon.stub(util, 'redirectResponse')

test('cookieMiddleware handles errors expected', async t => {
    const {errorPagePath} = testOptions.clientServerOptions
    const store = new MemorySessionStore()
    const cookies = cookiesMiddleware(testOptions, store)

    const reqStub = stubInterface<IncomingMessage>()
    const resStub = stubInterface<ServerResponse>()
    const urlStub = stubInterface<UrlWithParsedQuery>()
    const loggerStub = stubInterface<Logger>()

    urlStub.pathname = '/not-a-real-path'

    let ctx = createContext(reqStub, resStub, urlStub, loggerStub)

    ctx = await cookies(ctx)

    t.true(ctx.done)
    t.true(loggerStub.error.calledOnce)
    t.is(redirectStub.args[0][0], `${errorPagePath}?sc=500&sn=1`)
    redirectStub.reset()
})
