import * as util from '../../../src/middleware/util'

import {IncomingMessage, ServerResponse} from 'http'
import sinon, {stubInterface} from 'ts-sinon'

import {Client} from 'openid-client'
import {Logger} from 'pino'
import {MemorySessionStore} from '../../../src/session'
import {Options} from '../../../src/options'
import {UrlWithParsedQuery} from 'url'
import {UserInfoFromJwtService} from '../../../src/middleware/types'
import {createContext} from '../../../src/context'
import crs from 'crypto-random-string'
import test from 'ava'
import {userInfoMiddleware} from '../../../src/middleware/userinfo-middleware'

const sendJsonResponseStub = sinon.stub(util, 'sendJsonResponse')

test('userInfoMiddleware should throw access denied when no session is present', async t => {
    const clientStub = stubInterface<Client>()
    const optionsStub = stubInterface<Options>()
    const userInfoFromJwtServiceStub = stubInterface<UserInfoFromJwtService>()
    const store = new MemorySessionStore()
    const pathname = '/unit-test-user-info'
    const testSessionId = crs({length: 10})

    const userinfo = userInfoMiddleware({
        pathname,
        sessionStore: store,
        client: clientStub,
        options: optionsStub,
        userInfoFromJwtService: userInfoFromJwtServiceStub
    })

    const reqStub = stubInterface<IncomingMessage>()
    const resStub = stubInterface<ServerResponse>()
    const urlStub = stubInterface<UrlWithParsedQuery>()
    const loggerStub = stubInterface<Logger>()
    urlStub.pathname = pathname

    let ctx = createContext(reqStub, resStub, urlStub, loggerStub)
    ctx.sessionId = testSessionId

    ctx = await userinfo(ctx)

    t.true(ctx.done)
    t.true(sendJsonResponseStub.calledOnce)
    t.is(sendJsonResponseStub.args[0][0], 401)
    sendJsonResponseStub.reset()
})
