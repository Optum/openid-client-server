import type {IncomingMessage, ServerResponse} from 'http'
import type {UrlWithParsedQuery} from 'url'
import sinon, {stubInterface} from 'ts-sinon'
import type {Client} from 'openid-client'
import type {Logger} from 'pino'
import test from 'ava'
import * as util from '../../../src/middleware/util'

import {MemorySessionStore} from '../../../src/session'
import {testOptions} from '../../helpers/test-options'
import {createContext} from '../../../src/context'
import {signInMiddleware} from '../../../src/middleware/signin-middleware'

const redirectStub = sinon.stub(util, 'redirectResponse')

test('signInMiddleware should throw an error if no session id is available', async t => {
    const {signInPath} = testOptions.clientServerOptions
    const clientStub = stubInterface<Client>()
    const store = new MemorySessionStore()
    const signin = signInMiddleware(clientStub, signInPath, testOptions, store)

    const requestStub = stubInterface<IncomingMessage>()
    const resStub = stubInterface<ServerResponse>()
    const urlStub = stubInterface<UrlWithParsedQuery>()
    const loggerStub = stubInterface<Logger>()
    urlStub.pathname = signInPath

    let ctx = createContext(requestStub, resStub, urlStub, loggerStub)

    ctx = await signin(ctx)

    t.true(ctx.done)
    t.true(loggerStub.error.calledOnce)
    redirectStub.reset()
})
