import type {IncomingMessage, ServerResponse} from 'http'

import type {UrlWithParsedQuery} from 'url'
import type {Client} from 'openid-client'
import type {Logger} from 'pino'
import {stubInterface} from 'ts-sinon'
import test from 'ava'
import {MemorySessionStore} from '../../../src/session'
import {testOptions} from '../../helpers/test-options'
import {createContext} from '../../../src/context'
import {securePathCheckMiddleware} from '../../../src/middleware/secure-path-check-middleware'

test('securePathCheckMiddleware should skip if secure paths are not configured', async t => {
    const sessionStore = new MemorySessionStore()
    const clientStub = stubInterface<Client>()
    const requestStub = stubInterface<IncomingMessage>()
    const resStub = stubInterface<ServerResponse>()
    const urlStub = stubInterface<UrlWithParsedQuery>()
    const loggerStub = stubInterface<Logger>()

    const ctx = createContext(requestStub, resStub, urlStub, loggerStub)

    const middleware = securePathCheckMiddleware(
        testOptions,
        sessionStore,
        clientStub
    )

    const passToHandler = await middleware(ctx)

    t.true(passToHandler)
})
