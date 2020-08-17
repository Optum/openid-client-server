import {IncomingMessage, ServerResponse} from 'http'

import {Client} from 'openid-client'
import {Logger} from 'pino'
import {MemorySessionStore} from '../../../src/session'
import {testOptions} from '../../helpers/test-options'
import {UrlWithParsedQuery} from 'url'
import {createContext} from '../../../src/context'
import {securePathCheckMiddleware} from '../../../src/middleware/secure-path-check-middleware'
import {stubInterface} from 'ts-sinon'
import test from 'ava'

test('securePathCheckMiddleware should skip if secure paths are not configured', async t => {
    const sessionStore = new MemorySessionStore()
    const clientStub = stubInterface<Client>()
    const reqStub = stubInterface<IncomingMessage>()
    const resStub = stubInterface<ServerResponse>()
    const urlStub = stubInterface<UrlWithParsedQuery>()
    const loggerStub = stubInterface<Logger>()

    const ctx = createContext(reqStub, resStub, urlStub, loggerStub)

    const middleware = securePathCheckMiddleware(
        testOptions,
        sessionStore,
        clientStub
    )

    const passToHandler = await middleware(ctx)

    t.true(passToHandler)
})
