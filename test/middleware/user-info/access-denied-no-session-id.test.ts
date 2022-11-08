import type {IncomingMessage, ServerResponse} from 'http'
import type {UrlWithParsedQuery} from 'url'
import sinon, {stubInterface} from 'ts-sinon'
import type {Client} from 'openid-client'
import type {Logger} from 'pino'
import test from 'ava'
import * as util from '../../../src/middleware/util'

import {MemorySessionStore} from '../../../src/session'
import type {Options} from '../../../src/options'
import type {UserInfoFromJwtService} from '../../../src/middleware/types'
import {createContext} from '../../../src/context'
import {userInfoMiddleware} from '../../../src/middleware/userinfo-middleware'

const sendJsonResponseStub = sinon.stub(util, 'sendJsonResponse')

test('userInfoMiddleware should throw access denied when no session id is present', async t => {
    const clientStub = stubInterface<Client>()
    const optionsStub = stubInterface<Options>()
    const userInfoFromJwtServiceStub = stubInterface<UserInfoFromJwtService>()
    const store = new MemorySessionStore()
    const pathname = '/unit-test-user-info'

    const userinfo = userInfoMiddleware({
        pathname,
        sessionStore: store,
        client: clientStub,
        options: optionsStub,
        userInfoFromJwtService: userInfoFromJwtServiceStub
    })

    const requestStub = stubInterface<IncomingMessage>()
    const resStub = stubInterface<ServerResponse>()
    const urlStub = stubInterface<UrlWithParsedQuery>()
    const loggerStub = stubInterface<Logger>()
    urlStub.pathname = pathname

    let ctx = createContext(requestStub, resStub, urlStub, loggerStub)

    ctx = await userinfo(ctx)

    t.true(ctx.done)
    t.true(sendJsonResponseStub.calledOnce)
    t.is(sendJsonResponseStub.args[0][0], 401)
    sendJsonResponseStub.reset()
})
