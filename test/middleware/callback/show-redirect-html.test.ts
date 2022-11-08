import type {IncomingMessage, ServerResponse} from 'http'
import type {UrlWithParsedQuery} from 'url'
import sinon, {stubInterface} from 'ts-sinon'
import type {Client} from 'openid-client'
import type {Logger} from 'pino'
import test from 'ava'
import * as util from '../../../src/middleware/util'

import {testOptions} from '../../helpers/test-options'
import {callbackMiddleware} from '../../../src/middleware/callback-middleware'
import {createContext} from '../../../src/context'

const showResponseStub = sinon.stub(util, 'showResponse')

test('callbackMiddleware should show redirect html', async t => {
    const {callbackPath, processCallbackPath} = testOptions.clientServerOptions
    const clientStub = stubInterface<Client>()

    const callback = callbackMiddleware(
        clientStub,
        callbackPath,
        processCallbackPath,
        testOptions
    )

    const requestStub = stubInterface<IncomingMessage>()
    const resStub = stubInterface<ServerResponse>()
    const urlStub = stubInterface<UrlWithParsedQuery>()
    const loggerStub = stubInterface<Logger>()
    urlStub.pathname = callbackPath

    let ctx = createContext(requestStub, resStub, urlStub, loggerStub)
    clientStub.callbackParams.returns({
        code: 'asdfington',
        session_state: 'fdsaingto'
    })

    ctx = await callback(ctx)

    t.true(ctx.done)
    t.true(clientStub.callbackParams.calledOnce)
    t.true(showResponseStub.calledOnce)
    t.is(showResponseStub.args[0][0], 200)
    t.true(showResponseStub.args[0][1].includes(processCallbackPath))
    t.is(showResponseStub.args[0][2], ctx.res)
    showResponseStub.reset()
})
