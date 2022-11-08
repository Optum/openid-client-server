import type {IncomingMessage, ServerResponse} from 'http'
import type {UrlWithParsedQuery} from 'url'
import sinon, {stubInterface} from 'ts-sinon'
import type {Client} from 'openid-client'
import type {Logger} from 'pino'
import test from 'ava'
import * as util from '../../../src/middleware/util'

import {MemorySessionStore} from '../../../src/session'
import type {Options} from '../../../src/options'
import {testOptions} from '../../helpers/test-options'
import {createContext} from '../../../src/context'
import {signInMiddleware} from '../../../src/middleware/signin-middleware'

const redirectStub = sinon.stub(util, 'redirectResponse')

test('signInMiddleware should include scope in auth url if included in clientServerOptions', async t => {
    const {signInPath} = testOptions.clientServerOptions
    const clientStub = stubInterface<Client>()
    const store = new MemorySessionStore()
    const testOptionsWithScope = util.clone(testOptions) as Options
    const unitTestSessionId = 'unit-test-session-id'
    const unitTestScope = 'api://unit-test/access'
    const unitTestAuthUrl =
        'https://examples.auth0.com/authorize?scope=api://unit-test/access'
    testOptionsWithScope.clientServerOptions.scope = unitTestScope

    const signin = signInMiddleware(
        clientStub,
        signInPath,
        testOptionsWithScope,
        store
    )

    const requestStub = stubInterface<IncomingMessage>()
    const resStub = stubInterface<ServerResponse>()
    const urlStub = stubInterface<UrlWithParsedQuery>()
    const loggerStub = stubInterface<Logger>()
    urlStub.pathname = signInPath

    let ctx = createContext(requestStub, resStub, urlStub, loggerStub)
    ctx.sessionId = unitTestSessionId
    clientStub.authorizationUrl.returns(unitTestAuthUrl)

    const storeSetSpy = sinon.spy(store, 'set')

    ctx = await signin(ctx)

    t.true(ctx.done)
    t.true(storeSetSpy.calledOnce)
    t.is(storeSetSpy.args[0][0], unitTestSessionId)
    t.is(clientStub.authorizationUrl.args[0][0]?.scope, unitTestScope)
    t.is(redirectStub.args[0][0], unitTestAuthUrl)
    redirectStub.reset()
})
