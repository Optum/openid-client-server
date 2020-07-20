import {IncomingMessage, ServerResponse} from 'http'

import {Logger} from 'pino'
import {UrlWithParsedQuery} from 'url'
import {createContext} from '../src/context'
import {stubInterface} from 'ts-sinon'
import test from 'ava'

test('createContext should default sessionId, tokenSet and done as expected', t => {
    const reqStub = stubInterface<IncomingMessage>()
    const resStub = stubInterface<ServerResponse>()
    const urlStub = stubInterface<UrlWithParsedQuery>()
    const loggerStub = stubInterface<Logger>()

    const ctx = createContext(reqStub, resStub, urlStub, loggerStub)

    t.is(ctx.sessionId, null)
    t.is(ctx.tokenSet, null)
    t.is(ctx.done, false)
})
