import * as util from '../../../src/middleware/util'

import {IncomingMessage, ServerResponse} from 'http'
import sinon, {stubInterface} from 'ts-sinon'

import {Client} from 'openid-client'
import {Logger} from 'pino'
import {MemorySessionStore} from '../../../src/session'
import {makeOptionsWithSecurePaths} from '../../helpers/test-options'
import {UrlWithParsedQuery} from 'url'
import {createContext} from '../../../src/context'
import crs from 'crypto-random-string'
import {securePathCheckMiddleware} from '../../../src/middleware/secure-path-check-middleware'
import test from 'ava'

const redirectStub = sinon.stub(util, 'redirectResponse')

const testPath = '/dashboard'

const testOptions = makeOptionsWithSecurePaths([testPath])

test('securePathCheckMiddleware should redirect signin when no session', async t => {
    const sessionStore = new MemorySessionStore()
    const clientStub = stubInterface<Client>()
    const reqStub = stubInterface<IncomingMessage>()
    const resStub = stubInterface<ServerResponse>()
    const urlStub = stubInterface<UrlWithParsedQuery>()
    const loggerStub = stubInterface<Logger>()

    const ctx = createContext(reqStub, resStub, urlStub, loggerStub)
    ctx.sessionId = crs({length: 10})

    const middleware = securePathCheckMiddleware(
        testOptions,
        sessionStore,
        clientStub
    )

    const passToHandler = await middleware(ctx)

    t.false(passToHandler)
    t.true(redirectStub.calledOnce)
    t.is(redirectStub.args[0][0], testOptions.clientServerOptions.signInPath)
    t.is(redirectStub.args[0][1], resStub)
})
