import type {IncomingMessage, ServerResponse} from 'http'
import type {UrlWithParsedQuery} from 'url'
import sinon, {stubInterface} from 'ts-sinon'
import type {Client} from 'openid-client'
import type {Logger} from 'pino'
import test from 'ava'
import * as util from '../../../src/middleware/util'

import {AccessDeniedErrorResponse, qsOfErrorResponse} from '../../../src/status'

import {MemorySessionStore} from '../../../src/session'
import {makeOptionsWithSecurePaths} from '../../helpers/test-options'
import {createContext} from '../../../src/context'
import {securePathCheckMiddleware} from '../../../src/middleware/secure-path-check-middleware'

const redirectStub = sinon.stub(util, 'redirectResponse')

const testPath = '/dashboard'

const testOptions = makeOptionsWithSecurePaths([testPath])

test('securePathCheckMiddleware should redirect access denied when no session id', async t => {
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

    t.false(passToHandler)
    t.true(redirectStub.calledOnce)
    t.is(
        redirectStub.args[0][0],
        `${testOptions.clientServerOptions.errorPagePath}?${qsOfErrorResponse(
            AccessDeniedErrorResponse
        )}`
    )
    t.is(redirectStub.args[0][1], resStub)
})
