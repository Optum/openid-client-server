import type {IncomingMessage, ServerResponse} from 'http'

import type {UrlWithParsedQuery} from 'url'
import type {Logger} from 'pino'
import {stubInterface} from 'ts-sinon'
import test from 'ava'
import {createContext} from '../src/context'

test('createContext should default sessionId, tokenSet and done as expected', t => {
    const requestStub = stubInterface<IncomingMessage>()
    const resStub = stubInterface<ServerResponse>()
    const urlStub = stubInterface<UrlWithParsedQuery>()
    const loggerStub = stubInterface<Logger>()

    const ctx = createContext(requestStub, resStub, urlStub, loggerStub)

    t.is(ctx.sessionId, null)
    t.is(ctx.tokenSet, null)
    t.is(ctx.done, false)
})
