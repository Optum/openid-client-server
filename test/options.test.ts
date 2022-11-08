import test from 'ava'
import {OptionsError, resolveOptions} from '../src/options'

test('resolveOptions should fail when no env are set', t => {
    t.throws(() => resolveOptions(), {
        instanceOf: OptionsError
    })
})

test('resolveOptions pass with the minimum required envs', t => {
    const testClientId = 'test-client-id'
    const testDiscoveryEndpoint =
        'https://examples.auth0.com/.well-known/openid-configuration'
    const testSessionKeys = 'test-session-keys'

    const originalClientId = process.env.OPENID_CLIENT_ID
    const originalDiscoveryEndpoint = process.env.OPENID_DISCOVERY_ENDPOINT
    const originalSessionKeys = process.env.OPENID_SESSION_KEYS

    process.env.OPENID_DISCOVERY_ENDPOINT = testDiscoveryEndpoint
    process.env.OPENID_CLIENT_ID = testClientId
    process.env.OPENID_SESSION_KEYS = testSessionKeys

    const {
        clientMetadata,
        clientServerOptions,
        sessionOptions
    } = resolveOptions()

    process.env.OPENID_CLIENT_ID = originalClientId
    process.env.OPENID_DISCOVERY_ENDPOINT = originalDiscoveryEndpoint
    process.env.OPENID_SESSION_KEYS = originalSessionKeys

    t.is(clientMetadata.client_id, testClientId)
    t.is(clientServerOptions.discoveryEndpoint, testDiscoveryEndpoint)
    t.deepEqual(sessionOptions.sessionKeys, [testSessionKeys])
})

test('resolveOptions pass with the proxy params passed', t => {
    const testClientId = 'test-client-id'
    const testDiscoveryEndpoint =
        'https://examples.auth0.com/.well-known/openid-configuration'
    const testSessionKeys = 'test-session-keys'
    const proxyHosts =
        'https://examples.auth0.com/.well-known/openid-configuration'
    const excludeCookie = 'true'

    const originalClientId = process.env.OPENID_CLIENT_ID
    const originalDiscoveryEndpoint = process.env.OPENID_DISCOVERY_ENDPOINT
    const originalSessionKeys = process.env.OPENID_SESSION_KEYS

    process.env.OPENID_DISCOVERY_ENDPOINT = testDiscoveryEndpoint
    process.env.OPENID_CLIENT_ID = testClientId
    process.env.OPENID_SESSION_KEYS = testSessionKeys
    process.env.OPENID_PROXY_EXCLUDE_COOKIE = excludeCookie
    process.env.OPENID_PROXY_HOSTS = proxyHosts

    const {
        clientMetadata,
        clientServerOptions,
        sessionOptions,
        proxyOptions
    } = resolveOptions()

    process.env.OPENID_CLIENT_ID = originalClientId
    process.env.OPENID_DISCOVERY_ENDPOINT = originalDiscoveryEndpoint
    process.env.OPENID_SESSION_KEYS = originalSessionKeys

    t.is(clientMetadata.client_id, testClientId)
    t.is(proxyOptions.excludeCookie[0], true)
    t.is(clientServerOptions.discoveryEndpoint, testDiscoveryEndpoint)
    t.deepEqual(sessionOptions.sessionKeys, [testSessionKeys])
})
