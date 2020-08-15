import * as util from '../../../src/middleware/util'

import {IncomingMessage, ServerResponse} from 'http'
import sinon, {stubInterface} from 'ts-sinon'

import {Client} from 'openid-client'
import {Logger} from 'pino'
import {MemorySessionStore} from '../../../src/session'
import {testOptions} from '../../helpers/test-options'
import {UrlWithParsedQuery} from 'url'
import {createContext} from '../../../src/context'
import {signInMiddleware} from '../../../src/middleware/signin-middleware'
import test from 'ava'

const redirectStub = sinon.stub(util, 'redirectResponse')

test('signInMiddleware should throw an error if no session id is available', async t => {
    const {signInPath} = testOptions.clientServerOptions
    const clientStub = stubInterface<Client>()
    const store = new MemorySessionStore()
    const signin = signInMiddleware(clientStub, signInPath, testOptions, store)

    const reqStub = stubInterface<IncomingMessage>()
    const resStub = stubInterface<ServerResponse>()
    const urlStub = stubInterface<UrlWithParsedQuery>()
    const loggerStub = stubInterface<Logger>()
    urlStub.pathname = signInPath

    let ctx = createContext(reqStub, resStub, urlStub, loggerStub)

    ctx = await signin(ctx)

    t.true(ctx.done)
    t.true(loggerStub.error.calledOnce)
    redirectStub.reset()
})
