import {Client, TokenSet} from 'openid-client'
import {IncomingMessage, ServerResponse} from 'http'

import {Logger} from 'pino'
import {MemorySessionStore} from '../../../src/session'
import {makeOptionsWithSecurePaths} from '../../helpers/test-options'
import {UrlWithParsedQuery} from 'url'
import {createContext} from '../../../src/context'
import crs from 'crypto-random-string'
import {securePathCheckMiddleware} from '../../../src/middleware/secure-path-check-middleware'
import {stubInterface} from 'ts-sinon'
import test from 'ava'
import {v4 as uuid} from 'uuid'

const testPath = '/dashboard'

const testOptions = makeOptionsWithSecurePaths([testPath])

test('securePathCheckMiddleware check true refreshed session', async t => {
    const sessionStore = new MemorySessionStore()
    const clientStub = stubInterface<Client>()
    const reqStub = stubInterface<IncomingMessage>()
    const resStub = stubInterface<ServerResponse>()
    const urlStub = stubInterface<UrlWithParsedQuery>()
    const tokenSetStub = stubInterface<TokenSet>()
    const loggerStub = stubInterface<Logger>()

    tokenSetStub.expired.returns(true)
    tokenSetStub.access_token = uuid()

    clientStub.refresh.resolves(tokenSetStub)

    const ctx = createContext(reqStub, resStub, urlStub, loggerStub)
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
