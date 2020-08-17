import * as util from '../../../src/middleware/util'

import {IncomingMessage, ServerResponse} from 'http'
import sinon, {stubInterface} from 'ts-sinon'

import {Client} from 'openid-client'
import {Logger} from 'pino'
import {testOptions} from '../../helpers/test-options'
import {UrlWithParsedQuery} from 'url'
import {callbackMiddleware} from '../../../src/middleware/callback-middleware'
import {createContext} from '../../../src/context'
import test from 'ava'

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

    const reqStub = stubInterface<IncomingMessage>()
    const resStub = stubInterface<ServerResponse>()
    const urlStub = stubInterface<UrlWithParsedQuery>()
    const loggerStub = stubInterface<Logger>()
    urlStub.pathname = callbackPath

    let ctx = createContext(reqStub, resStub, urlStub, loggerStub)
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
