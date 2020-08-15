import * as util from '../../../src/middleware/util'

import {AccessDeniedErrorResponse, qsOfErrorResponse} from '../../../src/status'
import {IncomingMessage, ServerResponse} from 'http'
import sinon, {stubInterface} from 'ts-sinon'

import {Client} from 'openid-client'
import {Logger} from 'pino'
import {MemorySessionStore} from '../../../src/session'
import {makeOptionsWithSecurePaths} from '../../helpers/test-options'
import {UrlWithParsedQuery} from 'url'
import {createContext} from '../../../src/context'
import {securePathCheckMiddleware} from '../../../src/middleware/secure-path-check-middleware'
import test from 'ava'

const redirectStub = sinon.stub(util, 'redirectResponse')

const testPath = '/dashboard'

const testOptions = makeOptionsWithSecurePaths([testPath])

test('securePathCheckMiddleware should redirect access denied when no session id', async t => {
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
