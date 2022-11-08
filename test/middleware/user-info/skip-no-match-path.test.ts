import type {IncomingMessage, ServerResponse} from 'http'

import type {UrlWithParsedQuery} from 'url'
import type {Logger} from 'pino'
import {stubInterface} from 'ts-sinon'
import test from 'ava'
import type {UserInfoParams} from '../../../src/middleware/types'
import {createContext} from '../../../src/context'
import {userInfoMiddleware} from '../../../src/middleware/userinfo-middleware'

test('userInfoMiddleware should skip when path does not match', async t => {
    const userInfoParametersStub = stubInterface<UserInfoParams>()

    const requestStub = stubInterface<IncomingMessage>()
    const resStub = stubInterface<ServerResponse>()
    const urlStub = stubInterface<UrlWithParsedQuery>()
    const loggerStub = stubInterface<Logger>()
    urlStub.pathname = '/not-user-info'
    userInfoParametersStub.pathname = '/openid/userinfo'

    let ctx = createContext(requestStub, resStub, urlStub, loggerStub)

    const mw = userInfoMiddleware(userInfoParametersStub)

    ctx = await mw(ctx)

    t.false(ctx.done)
})
