import type {IncomingMessage, ServerResponse} from 'http'
import type {UrlWithParsedQuery} from 'url'
import type {Client, TokenSet} from 'openid-client'

import type {Logger} from 'pino'
import crs from 'crypto-random-string'
import {stubInterface} from 'ts-sinon'
import test from 'ava'
import {v4 as uuid} from 'uuid'
import {MemorySessionStore} from '../../../src/session'
import {makeOptionsWithSecurePaths} from '../../helpers/test-options'
import {createContext} from '../../../src/context'
import {securePathCheckMiddleware} from '../../../src/middleware/secure-path-check-middleware'

const testPath = '/dashboard'

const testOptions = makeOptionsWithSecurePaths([testPath])

test('securePathCheckMiddleware check true refreshed session', async t => {
    const sessionStore = new MemorySessionStore()
    const clientStub = stubInterface<Client>()
    const requestStub = stubInterface<IncomingMessage>()
    const resStub = stubInterface<ServerResponse>()
    const urlStub = stubInterface<UrlWithParsedQuery>()
    const tokenSetStub = stubInterface<TokenSet>()
    const loggerStub = stubInterface<Logger>()

    tokenSetStub.expired.returns(true)
    tokenSetStub.access_token = uuid()

    clientStub.refresh.resolves(tokenSetStub)

    const ctx = createContext(requestStub, resStub, urlStub, loggerStub)
    ctx.sessionId = crs({length: 10})

    await sessionStore.set(ctx.sessionId, {
        tokenSet: tokenSetStub
    })

    const middleware = securePathCheckMiddleware(
        testOptions,
        sessionStore,
        clientStub
    )

    const passToHandler = await middleware(ctx)

    t.true(passToHandler)
    t.true(tokenSetStub.expired.calledTwice)
    t.true(clientStub.refresh.calledOnce)
})
