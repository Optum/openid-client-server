import * as util from '../../../src/middleware/util'

import {IncomingMessage, ServerResponse} from 'http'
import sinon, {stubInterface} from 'ts-sinon'

import {Client} from 'openid-client'
import {Logger} from 'pino'
import {MemorySessionStore} from '../../../src/session'
import {testOptionsWithoutScope} from '../../helpers/test-options'
import {UrlWithParsedQuery} from 'url'
import {createContext} from '../../../src/context'
import {signInMiddleware} from '../../../src/middleware/signin-middleware'
import test from 'ava'

const redirectStub = sinon.stub(util, 'redirectResponse')

test('signInMiddleware should not include scope in auth url if not in clientServerOptions', async t => {
    const {signInPath} = testOptionsWithoutScope.clientServerOptions
    const clientStub = stubInterface<Client>()
    const store = new MemorySessionStore()
    const unitTestSessionId = 'unit-test-session-id'
    const unitTestAuthUrl =
        'https://examples.auth0.com/authorize?scope=api://unit-test/access'

    const signin = signInMiddleware(
        clientStub,
        signInPath,
        testOptionsWithoutScope,
        store
    )

    const reqStub = stubInterface<IncomingMessage>()
    const resStub = stubInterface<ServerResponse>()
    const urlStub = stubInterface<UrlWithParsedQuery>()
    const loggerStub = stubInterface<Logger>()
    urlStub.pathname = signInPath

    let ctx = createContext(reqStub, resStub, urlStub, loggerStub)
    ctx.sessionId = unitTestSessionId
    clientStub.authorizationUrl.returns(unitTestAuthUrl)

    const storeSetSpy = sinon.spy(store, 'set')

    ctx = await signin(ctx)

    t.true(ctx.done)
    t.true(storeSetSpy.calledOnce)
    t.is(storeSetSpy.args[0][0], unitTestSessionId)
    t.is(clientStub.authorizationUrl.args[0][0]?.scope, undefined)
    t.is(redirectStub.args[0][0], unitTestAuthUrl)
    redirectStub.reset()
})
