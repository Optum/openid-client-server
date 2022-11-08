import type {Client, IssuerMetadata} from 'openid-client'

import {stubInterface} from 'ts-sinon'
import test from 'ava'
import type {Options} from '../../src/options'
import {testOptions, testOptionsWithProxy} from '../helpers/test-options'
import type {SessionStore} from '../../src/session'
import {clone} from '../../src/middleware/util'
import {createMiddleware} from '../../src/middleware'

test('createMiddleware should initialize a Pipeline with proxy paths as expected', t => {
    const issuerMetadataStub = stubInterface<IssuerMetadata>()
    const clientStub = stubInterface<Client>()
    const storeStub = stubInterface<SessionStore>()

    const middleware = createMiddleware(
        issuerMetadataStub,
        clientStub,
        testOptionsWithProxy,
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
        excludeOriginHeaders: [],
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
