import * as util from '../../../src/middleware/util'

import {IncomingMessage, ServerResponse} from 'http'
import sinon, {stubInterface} from 'ts-sinon'

import {Client} from 'openid-client'
import {Logger} from 'pino'
import {MemorySessionStore} from '../../../src/session'
import {testOptions} from '../../helpers/test-options'
import {UrlWithParsedQuery} from 'url'
import {createContext} from '../../../src/context'
import {processCallbackMiddleware} from '../../../src/middleware/process-callback-middleware'
import test from 'ava'
import {v4 as uuid} from 'uuid'

const redirectResponseStub = sinon.stub(util, 'redirectResponse')

test('processCallbackMiddleware should throw invalid session when no session or csrfString is found', async t => {
    const {processCallbackPath, errorPagePath} = testOptions.clientServerOptions
    const clientStub = stubInterface<Client>()
    const sessionStore = new MemorySessionStore()
    const testSessionId = uuid()

    const processCallback = processCallbackMiddleware(
        clientStub,
        processCallbackPath,
        testOptions,
        sessionStore
    )

    const reqStub = stubInterface<IncomingMessage>()
    const resStub = stubInterface<ServerResponse>()
    const urlStub = stubInterface<UrlWithParsedQuery>()
    const loggerStub = stubInterface<Logger>()
    urlStub.pathname = processCallbackPath

    let ctx = createContext(reqStub, resStub, urlStub, loggerStub)
    ctx.sessionId = testSessionId

    ctx = await processCallback(ctx)

    t.true(ctx.done)
    t.true(redirectResponseStub.args[0][0].includes(errorPagePath))
    t.is(redirectResponseStub.args[0][1], ctx.res)
    redirectResponseStub.resetHistory()

    let ctx2 = createContext(reqStub, resStub, urlStub, loggerStub)
    ctx2.sessionId = testSessionId

    await sessionStore.set(testSessionId, {
        createdAt: Date.now()
    })

    ctx2 = await processCallback(ctx2)

    t.true(ctx2.done)
    t.true(redirectResponseStub.args[0][0].includes(errorPagePath))
    t.is(redirectResponseStub.args[0][1], ctx2.res)
    redirectResponseStub.reset()
})
