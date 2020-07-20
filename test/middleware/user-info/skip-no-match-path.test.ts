import {IncomingMessage, ServerResponse} from 'http'

import {Logger} from 'pino'
import {UrlWithParsedQuery} from 'url'
import {UserInfoParams} from '../../../src/middleware/types'
import {createContext} from '../../../src/context'
import {stubInterface} from 'ts-sinon'
import test from 'ava'
import {userInfoMiddleware} from '../../../src/middleware/userinfo-middleware'

test('userInfoMiddleware should skip when path does not match', async t => {
    const userInfoParamsStub = stubInterface<UserInfoParams>()

    const reqStub = stubInterface<IncomingMessage>()
    const resStub = stubInterface<ServerResponse>()
    const urlStub = stubInterface<UrlWithParsedQuery>()
    const loggerStub = stubInterface<Logger>()
    urlStub.pathname = '/not-user-info'
    userInfoParamsStub.pathname = '/openid/userinfo'

    let ctx = createContext(reqStub, resStub, urlStub, loggerStub)

    const mw = userInfoMiddleware(userInfoParamsStub)

    ctx = await mw(ctx)

    t.false(ctx.done)
})
