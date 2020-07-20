import * as util from '../../../src/middleware/util'

import {IncomingMessage, ServerResponse} from 'http'
import sinon, {stubInterface} from 'ts-sinon'

import {Client} from 'openid-client'
import {Logger} from 'pino'
import {Options} from '../../../src/options'
import {UrlWithParsedQuery} from 'url'
import {callbackMiddleware} from '../../../src/middleware/callback-middleware'
import {createContext} from '../../../src/context'
import test from 'ava'

const showResponseStub = sinon.stub(util, 'showResponse')

const testOptions: Options = {
    clientServerOptions: {
        discoveryEndpoint:
            'https://examples.auth0.com/.well-known/openid-configuration',
        signInPath: '/openid/signin',
        callbackPath: '/openid/callback',
        processCallbackPath: '/openid/process-callback',
        signOutPath: '/openid/signout',
        userInfoPath: '/openid/userinfo',
        errorPagePath: '/openid-error',
        enablePKCE: false,
        enableOauth2: false,
        authorizationEndpoint: 'http://not-an-authorization-endpoint.test',
        tokenEndpoint: 'http://not-a-token-endpoint.test',
        userInfoEndpoint: 'http://not-a-user-info-endpoint.test'
    },
    sessionOptions: {
        sessionKeys: ['test-session-keys'],
        sessionName: 'openid:session',
        sameSite: true
    },
    clientMetadata: {client_id: 'test-client-id'},
    loggerOptions: {
        level: 'silent',
        useLevelLabels: true,
        name: 'openid-client-server'
    },
    proxyOptions: {
        proxyPaths: [],
        proxyHosts: [],
        excludeCookie: [],
        useIdToken: []
    }
}

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
