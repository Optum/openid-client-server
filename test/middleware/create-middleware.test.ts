import {Client, IssuerMetadata} from 'openid-client'

import {Options} from '../../src/options'
import {SessionStore} from '../../src/session'
import {clone} from '../../src/middleware/util'
import {createMiddleware} from '../../src/middleware'
import {stubInterface} from 'ts-sinon'
import test from 'ava'

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
        proxyPaths: ['/proxy'],
        proxyHosts: ['https://host.test'],
        excludeCookie: [false],
        useIdToken: [false]
    }
}

test('createMiddleware should initialize a Pipeline with proxy paths as expected', t => {
    const issuerMetadataStub = stubInterface<IssuerMetadata>()
    const clientStub = stubInterface<Client>()
    const storeStub = stubInterface<SessionStore>()

    const middleware = createMiddleware(
        issuerMetadataStub,
        clientStub,
        testOptions,
        storeStub
    )

    t.truthy(middleware)
})

test('createMiddleware should initialize a Pipeline without proxy paths as expected', t => {
    const issuerMetadataStub = stubInterface<IssuerMetadata>()
    const clientStub = stubInterface<Client>()
    const storeStub = stubInterface<SessionStore>()
    const noProxyTestOptions = clone(testOptions) as Options

    noProxyTestOptions.proxyOptions = {
        proxyPaths: [],
        proxyHosts: [],
        excludeCookie: [],
        useIdToken: []
    }

    const middleware = createMiddleware(
        issuerMetadataStub,
        clientStub,
        testOptions,
        storeStub
    )

    t.truthy(middleware)
})
